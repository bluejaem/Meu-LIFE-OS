import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { firestoreStorage } from '@/lib/firestoreStorage';
import type { AcademicSubject, AiArtifacts } from '@/types';

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

const initialSubjects: AcademicSubject[] = [
  {
    id: uid(),
    name: 'Cálculo Diferencial e Integral',
    institution: 'UNINTER',
    semester: '2026.1',
    activeReviewPending: true,
    progress: 70,
    grade: 90,
    notes: 'Limites, derivadas parciais, integrais definidas e aplicações físicas.',
    artifacts: {
      notebookUrl: 'https://gemini.google.com/',
      slidesUrl: 'https://docs.google.com/presentation/u/0/',
      videoScriptUrl: 'https://docs.google.com/document/u/0/',
      flashcardsSummary: '1. O que é a Derivada? Taxa de variação instantânea de uma função em um ponto.\n2. Teorema Fundamental do Cálculo: Conecta derivação e integração como operações inversas.\n3. Regra da Cadeia: Derivada de funções compostas f(g(x)) = f\'(g(x)) * g\'(x).\n4. Integral Definida: Representa a área líquida sob a curva entre limites a e b.',
      infographicUrl: 'https://canva.com/'
    },
    updatedAt: now()
  },
  {
    id: uid(),
    name: 'Finanças Corporativas',
    institution: 'ETEP',
    semester: '2026.1',
    activeReviewPending: true,
    progress: 55,
    grade: 88,
    notes: 'Valuation, WACC, fluxo de caixa descontado e estrutura de capital.',
    artifacts: {
      notebookUrl: 'https://gemini.google.com/',
      slidesUrl: 'https://docs.google.com/presentation/u/0/',
      videoScriptUrl: 'https://docs.google.com/document/u/0/',
      flashcardsSummary: '1. O que é WACC? Custo Médio Ponderado de Capital (Weighted Average Cost of Capital).\n2. O que é VPL (NPV)? Valor Presente Líquido, critério soberano de decisão de investimento.\n3. O que é TIR (IRR)? Taxa Interna de Retorno, taxa que zera o VPL de um fluxo.\n4. O que é EBITDA? Lucro antes de juros, impostos, depreciação e amortização.',
      infographicUrl: 'https://canva.com/'
    },
    updatedAt: now()
  },
  {
    id: uid(),
    name: 'Estruturas de Dados e Algoritmos',
    institution: 'UNINTER',
    semester: '2026.1',
    activeReviewPending: false,
    progress: 85,
    grade: 95,
    notes: 'Complexidade de algoritmos Big O, árvores balanceadas e grafos.',
    artifacts: {
      notebookUrl: 'https://gemini.google.com/',
      slidesUrl: 'https://docs.google.com/presentation/u/0/',
      videoScriptUrl: 'https://docs.google.com/document/u/0/',
      flashcardsSummary: '1. O que é busca binária? Divisão e conquista em listas ordenadas com custo O(log n).\n2. Hash Map: Estrutura com tempo médio de busca e inserção O(1).\n3. Diferença entre Pilha e Fila: Pilha é LIFO (Last In First Out); Fila é FIFO.\n4. Árvore AVL: Árvore binária de busca autobalanceada garantindo O(log n).',
      infographicUrl: 'https://canva.com/'
    },
    updatedAt: now()
  },
  {
    id: uid(),
    name: 'Deep Learning & Modelos de Linguagem (LLMs)',
    institution: 'ETEP',
    semester: '2026.1',
    activeReviewPending: true,
    progress: 45,
    grade: 92,
    notes: 'Arquitetura Transformer, Mecanismo de Atenção, Fine-Tuning e RAG.',
    artifacts: {
      notebookUrl: 'https://gemini.google.com/',
      slidesUrl: 'https://docs.google.com/presentation/u/0/',
      videoScriptUrl: 'https://docs.google.com/document/u/0/',
      flashcardsSummary: '1. O que é Self-Attention? Cálculo de afinidade ponderada entre todos os tokens de uma sequência.\n2. O que é RAG? Retrieval-Augmented Generation para aterramento com fontes externas.\n3. O que é Fine-Tuning? Treinamento adicional em conjunto de dados especializado.\n4. O que é Embedding? Representação vetorial densa de significados semânticos.',
      infographicUrl: 'https://canva.com/'
    },
    updatedAt: now()
  }
];

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
      storage: createJSONStorage(() => firestoreStorage)
    }
  )
);
