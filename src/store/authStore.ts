import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  username: string;
  passwordHash: string; // Em ambiente real seria hash, aqui apenas para simulação
  avatarUrl?: string;
}

interface AuthState {
  users: User[];
  currentUser: User | null;
  register: (user: Omit<User, 'id'>) => { success: boolean; error?: string; user?: User };
  login: (username: string, passwordHash: string) => { success: boolean; error?: string; user?: User };
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,

      register: (userData) => {
        const { users } = get();
        if (users.some(u => u.username === userData.username)) {
          return { success: false, error: 'Este nome de usuário já está em uso.' };
        }
        const newUser = { ...userData, id: crypto.randomUUID() };
        set({ users: [...users, newUser], currentUser: newUser });
        return { success: true, user: newUser };
      },

      login: (username, passwordHash) => {
        const { users } = get();
        const user = users.find(u => u.username === username);
        if (!user) {
          return { success: false, error: 'Usuário não encontrado.' };
        }
        if (user.passwordHash !== passwordHash) {
          return { success: false, error: 'Senha incorreta.' };
        }
        set({ currentUser: user });
        return { success: true, user };
      },

      logout: () => {
        set({ currentUser: null });
      }
    }),
    {
      name: 'planner-ti-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
