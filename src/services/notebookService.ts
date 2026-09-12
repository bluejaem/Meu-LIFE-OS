import { NotebookInfo, NotebookSource } from '@/types';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export const fetchNotebooks = async (): Promise<NotebookInfo[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'notebooks/123', displayName: 'Cálculo I - Resumos' },
        { name: 'notebooks/456', displayName: 'Engenharia de Software' },
        { name: 'notebooks/789', displayName: 'Física Clássica' }
      ]);
    }, 800);
  });
};

export const fetchNotebookSources = async (notebookId: string): Promise<NotebookSource[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: `notebooks/${notebookId}/sources/1`, displayName: 'Anotações de Aula.pdf' },
        { name: `notebooks/${notebookId}/sources/2`, displayName: 'Livro Texto Capítulo 3.pdf' }
      ]);
    }, 800);
  });
};

export const fetchNotebookFlashcards = async (notebookId: string): Promise<Flashcard[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 'f1', front: 'O que é a regra da cadeia?', back: 'Uma fórmula para calcular a derivada de funções compostas.' },
        { id: 'f2', front: 'O que é polimorfismo?', back: 'A capacidade de um objeto poder ser referenciado de várias formas.' }
      ]);
    }, 800);
  });
};
