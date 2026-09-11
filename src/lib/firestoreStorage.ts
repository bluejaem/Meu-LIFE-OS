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

export const firestoreStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const uid = await waitForAuth();
      if (uid) {
        const docRef = doc(db, 'userState', uid);
        const snap = await getDoc(docRef);
        
        if (snap.exists() && snap.data()[name]) {
          const remoteData = snap.data()[name];
          // Atualiza cache local
          try { localStorage.setItem(name, remoteData); } catch {}
          return remoteData;
        }
      }
    } catch (err) {
      console.warn('Aviso: Falha ao ler do Firestore, recuperando do localStorage:', err);
    }
    
    // Fallback garantido para o cache local
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    // 1. Sempre salva localmente primeiro (ultra-rápido, Local-First)
    try {
      localStorage.setItem(name, value);
    } catch {}

    // 2. Sincroniza em segundo plano com o Firestore
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const docRef = doc(db, 'userState', uid);
      await setDoc(docRef, { [name]: value }, { merge: true });
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
