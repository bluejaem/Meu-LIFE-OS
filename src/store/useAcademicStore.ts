import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { firestoreStorage } from '@/lib/firestoreStorage';
import type { AcademicSubject, AiArtifacts } from '@/types';

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
  updateArtifacts: (id: string, artifacts: Partial<AiArtifacts>) => void;
  
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
            // Garante retrocompatibilidade com campos de conveniência
            notebookUrl: data.artifacts?.notebookUrl,
            aiArtifacts: data.artifacts,
            lastReviewedDate: data.activeReviewPending ? undefined : new Date().toISOString().split('T')[0]
          }
        ]
      })),

      updateSubject: (id, data) => set((state) => ({
        subjects: state.subjects.map((sub) => {
          if (sub.id !== id) return sub;
          const merged = { ...sub, ...data, updatedAt: now() };
          // Atualiza referências cruzadas
          if (data.artifacts) {
            merged.notebookUrl = data.artifacts.notebookUrl;
            merged.aiArtifacts = data.artifacts;
          }
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

      updateArtifacts: (id, newArtifacts) => set((state) => ({
        subjects: state.subjects.map((sub) => {
          if (sub.id !== id) return sub;
          const updatedArtifacts: AiArtifacts = {
            ...sub.artifacts,
            ...newArtifacts
          };
          return {
            ...sub,
            artifacts: updatedArtifacts,
            notebookUrl: updatedArtifacts.notebookUrl,
            aiArtifacts: updatedArtifacts,
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
          const fakeSubjectNames = ['Cálculo Diferencial e Integral', 'Introdução à Programação'];
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
