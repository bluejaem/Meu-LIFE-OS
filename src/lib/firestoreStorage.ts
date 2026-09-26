import { StateStorage } from 'zustand/middleware';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const waitForAuth = () => new Promise<string | null>((resolve) => {
  if (auth.currentUser) {
    resolve(auth.currentUser.uid);
    return;
  }

  // Timeout preventivo de 1.5s para nunca bloquear a inicialização da store
  const timer = setTimeout(() => {
    resolve(auth.currentUser ? auth.currentUser.uid : null);
  }, 1500);

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    clearTimeout(timer);
    unsubscribe();
    resolve(user ? user.uid : null);
  });
});

function deduplicateSubjectsInStorageString(rawStr: string | null): string | null {
  if (!rawStr) return rawStr;
  try {
    const parsed = JSON.parse(rawStr);
    if (parsed?.state?.colleges && Array.isArray(parsed.state.colleges)) {
      parsed.state.colleges = parsed.state.colleges.map((col: any) => {
        if (col?.subjects && Array.isArray(col.subjects)) {
          return {
            ...col,
            subjects: Array.from(new Map(col.subjects.map((s: any) => [s.id, s])).values())
          };
        }
        return col;
      });
      return JSON.stringify(parsed);
    }
  } catch {}
  return rawStr;
}

export const firestoreStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const uid = await waitForAuth();
      if (uid) {
        const docRef = doc(db, 'userState', uid);
        const snap = await getDoc(docRef);
        
        if (snap.exists() && snap.data()[name]) {
          const remoteData = deduplicateSubjectsInStorageString(snap.data()[name]);
          // Atualiza cache local
          try { 
            if (remoteData) localStorage.setItem(name, remoteData); 
          } catch {}
          return remoteData;
        }
      }
    } catch (err) {
      console.warn('Aviso: Falha ao ler do Firestore, recuperando do localStorage:', err);
    }
    
    // Fallback garantido para o cache local
    try {
      return deduplicateSubjectsInStorageString(localStorage.getItem(name));
    } catch {
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    const cleanValue = deduplicateSubjectsInStorageString(value) || value;
    // 1. Sempre salva localmente primeiro (ultra-rápido, Local-First)
    try {
      localStorage.setItem(name, cleanValue);
    } catch {}

    // 2. Sincroniza em segundo plano com o Firestore
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const docRef = doc(db, 'userState', uid);
      await setDoc(docRef, { [name]: cleanValue }, { merge: true });
    } catch (err) {
      console.warn('Aviso: Falha ao sincronizar alteração com o Firestore:', err);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      localStorage.removeItem(name);
    } catch {}

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const docRef = doc(db, 'userState', uid);
      await setDoc(docRef, { [name]: null }, { merge: true });
    } catch (err) {
      console.warn('Aviso: Falha ao remover do Firestore:', err);
    }
  },
};
