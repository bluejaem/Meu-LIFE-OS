import { NotebookInfo, NotebookSource, NotebookArtifact } from '@/types';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

const API_BASE_URL = import.meta.env.VITE_GEMINI_API_URL || 'http://localhost:3000/api';

export const fetchNotebooks = async (): Promise<NotebookInfo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notebooks`);
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Falha ao buscar notebooks:', error);
    return [];
  }
};

export const fetchNotebookSources = async (notebookId: string): Promise<NotebookSource[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/sources`);
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Falha ao buscar fontes do notebook ${notebookId}:`, error);
    return [];
  }
};

export const fetchNotebookArtifacts = async (notebookId: string): Promise<NotebookArtifact[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/artifacts`);
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Falha ao buscar artefatos do notebook ${notebookId}:`, error);
    return [];
  }
};

// Mantido para compatibilidade com a UI atual (FlashcardsStudyModal) até que ela seja refatorada
export const fetchNotebookFlashcards = async (notebookId: string): Promise<Flashcard[]> => {
  const artifacts = await fetchNotebookArtifacts(notebookId);
  return artifacts
    .filter(a => a.type === 'flashcard')
    .map(a => ({
      id: a.id,
      front: a.content || '',
      back: a.backContent || ''
    }));
};
