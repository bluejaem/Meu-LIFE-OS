import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

interface AuthState {
  currentUser: User | null;
  loading: boolean;
  register: (name: string, username: string, passwordHash: string) => Promise<{ success: boolean; error?: string }>;
  login: (username: string, passwordHash: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserAvatar: (url: string) => Promise<void>;
}

const getEmailFromUsername = (username: string) => `${username.toLowerCase().trim()}@meulifeos.app`;

export const useAuthStore = create<AuthState>((set, get) => {
  // Inicializar o listener do Firebase Auth
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Buscar dados extras do Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        set({ 
          currentUser: { 
            id: firebaseUser.uid, 
            name: data.name || firebaseUser.displayName || '', 
            username: data.username || '', 
            avatarUrl: data.avatarUrl || firebaseUser.photoURL || undefined
          },
          loading: false
        });
      } else {
        // Fallback
        set({
          currentUser: {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            username: firebaseUser.email?.split('@')[0] || ''
          },
          loading: false
        });
      }
    } else {
      set({ currentUser: null, loading: false });
    }
  });

  return {
    currentUser: null,
    loading: true,

    register: async (name, username, passwordHash) => {
      try {
        const email = getEmailFromUsername(username);
        const userCredential = await createUserWithEmailAndPassword(auth, email, passwordHash);
        const user = userCredential.user;
        
        // Gerar avatar padrão
        const initialAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
        
        await updateProfile(user, {
          displayName: name,
          photoURL: initialAvatar
        });

        // Salvar metadados no Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name,
          username,
          avatarUrl: initialAvatar,
          createdAt: new Date().toISOString()
        });

        return { success: true };
      } catch (error: any) {
        let msg = 'Erro ao registrar.';
        if (error.code === 'auth/email-already-in-use') msg = 'Este nome de usuário já está em uso.';
        if (error.code === 'auth/weak-password') msg = 'A senha deve ter pelo menos 6 caracteres.';
        return { success: false, error: msg };
      }
    },

    login: async (username, passwordHash) => {
      try {
        const email = getEmailFromUsername(username);
        await signInWithEmailAndPassword(auth, email, passwordHash);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: 'Usuário não encontrado ou senha incorreta.' };
      }
    },

    logout: async () => {
      await signOut(auth);
    },

    updateUserAvatar: async (url: string) => {
      const { currentUser } = get();
      if (!currentUser || !auth.currentUser) return;

      await updateProfile(auth.currentUser, { photoURL: url });
      await setDoc(doc(db, 'users', currentUser.id), { avatarUrl: url }, { merge: true });
      
      set({ currentUser: { ...currentUser, avatarUrl: url } });
    }
  };
});
