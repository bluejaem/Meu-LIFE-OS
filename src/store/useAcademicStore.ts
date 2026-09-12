import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { firestoreStorage } from '@/lib/firestoreStorage';
import type { AcademicSubject } from '@/types';

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

const initialSubjects: AcademicSubject[] = [];

interface AcademicState {
  subjects: AcademicSubject[];
  
  // Ações solicitadas
  addSubject: (data: Omit<AcademicSubject, 'id' | 'updatedAt'>) => void;
  updateSubject: (id: string, data: Partial<AcademicSubject>) => void;
  deleteSubject: (id: string) => void;
  toggleReviewStatus: (id: string) => void;

  
  // Helper computado
  getPendingReviewsCount: () => number;
}

export const useAcademicStore = create<AcademicState>()(
  persist(
    (set, get) => ({
      subjects: initialSubjects,

      addSubject: (data) => set((state) => ({
        subjects: [
          ...state.subjects,
          {
            ...data,
            id: uid(),
            updatedAt: now(),
            lastReviewedDate: data.activeReviewPending ? undefined : new Date().toISOString().split('T')[0]
          }
        ]
      })),

      updateSubject: (id, data) => set((state) => ({
        subjects: state.subjects.map((sub) => {
          if (sub.id !== id) return sub;
          const merged = { ...sub, ...data, updatedAt: now() };
          // Atualiza referências cruzadas
          return merged;
        })
      })),

      deleteSubject: (id) => set((state) => ({
        subjects: state.subjects.filter((sub) => sub.id !== id)
      })),

      toggleReviewStatus: (id) => set((state) => ({
        subjects: state.subjects.map((sub) => {
          if (sub.id !== id) return sub;
          const newPending = !sub.activeReviewPending;
          return {
            ...sub,
            activeReviewPending: newPending,
            lastReviewedDate: newPending ? undefined : new Date().toISOString().split('T')[0],
            updatedAt: now()
          };
        })
      })),

      getPendingReviewsCount: () => {
        return get().subjects.filter((s) => s.activeReviewPending).length;
      }
    }),
    {
      name: 'academic-hub-storage',
      storage: createJSONStorage(() => firestoreStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Remove fake subjects from previous versions
          const fakeSubjectNames = [
            'Cálculo Diferencial e Integral', 
            'Introdução à Programação',
            'Finanças Corporativas',
            'Estruturas de Dados e Algoritmos',
            'Deep Learning & Modelos de Linguagem (LLMs)'
          ];
          if (persistedState && Array.isArray(persistedState.subjects)) {
            persistedState.subjects = persistedState.subjects.filter(
              (sub: any) => !fakeSubjectNames.includes(sub.name)
            );
          }
        }
        return persistedState;
      }
    }
  )
);
