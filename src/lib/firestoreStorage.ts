import { StateStorage } from 'zustand/middleware';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const waitForAuth = () => new Promise<string | null>((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    resolve(user ? user.uid : null);
  });
});

export const firestoreStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const uid = await waitForAuth();
    if (!uid) return null;

    const docRef = doc(db, 'userState', uid);
    const snap = await getDoc(docRef);
    
    if (snap.exists() && snap.data()[name]) {
      return snap.data()[name];
    }
    
    // Migração automática do localStorage para o Firestore
    const localData = localStorage.getItem(name);
    if (localData) {
      await setDoc(docRef, { [name]: localData }, { merge: true });
      return localData;
    }
    
    return null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    
    // Salvamos localmente também para servir como backup/cache rápido
    localStorage.setItem(name, value);

    const docRef = doc(db, 'userState', uid);
    await setDoc(docRef, { [name]: value }, { merge: true });
  },
  removeItem: async (name: string): Promise<void> => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    
    localStorage.removeItem(name);
    
    const docRef = doc(db, 'userState', uid);
    await setDoc(docRef, { [name]: null }, { merge: true });
  },
};
