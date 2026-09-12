import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
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
  googleAccessToken: string | null;
  register: (name: string, username: string, passwordHash: string) => Promise<{ success: boolean; error?: string }>;
  login: (username: string, passwordHash: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserAvatar: (url: string) => Promise<void>;
  connectGoogleAccount: () => Promise<{ success: boolean; error?: string }>;
}

const getEmailFromUsername = (username: string) => `${username.toLowerCase().trim()}@meulifeos.app`;

export const useAuthStore = create<AuthState>((set, get) => {
  // Safety timeout: nunca deixe a tela travada em loading eterno por mais de 3 segundos
  const safetyTimer = setTimeout(() => {
    if (get().loading) {
      console.warn('Firebase Auth safety timeout acionado. Liberando interface.');
      set({ loading: false });
    }
  }, 3000);

  // Inicializar o listener do Firebase Auth
  onAuthStateChanged(auth, async (firebaseUser) => {
    clearTimeout(safetyTimer);

    if (firebaseUser) {
      try {
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
          return;
        }
      } catch (error) {
        console.warn('Aviso: Não foi possível obter dados de perfil do Firestore, usando dados locais de autenticação:', error);
      }

      // Fallback garantido se o Firestore falhar ou doc não existir
      set({
        currentUser: {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuário',
          username: firebaseUser.email?.split('@')[0] || 'usuario',
          avatarUrl: firebaseUser.photoURL || undefined
        },
        loading: false
      });
    } else {
      set({ currentUser: null, loading: false, googleAccessToken: null });
    }
  });

  return {
    currentUser: null,
    loading: true,
    googleAccessToken: null,

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
      set({ googleAccessToken: null });
    },

    updateUserAvatar: async (url: string) => {
      const { currentUser } = get();
      if (!currentUser || !auth.currentUser) return;

      await updateProfile(auth.currentUser, { photoURL: url });
      await setDoc(doc(db, 'users', currentUser.id), { avatarUrl: url }, { merge: true });
      
      set({ currentUser: { ...currentUser, avatarUrl: url } });
    },

    connectGoogleAccount: async () => {
      try {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/drive.readonly'); // Escopo sugerido pelo usuário
        
        // Pode falhar dependendo das configurações do Firebase
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        
        if (token) {
          set({ googleAccessToken: token });
          return { success: true };
        } else {
          return { success: false, error: "Não foi possível obter o token de acesso do Google." };
        }
      } catch (error: any) {
        console.error("Erro ao conectar Google:", error);
        return { success: false, error: error.message };
      }
    }
  };
});
