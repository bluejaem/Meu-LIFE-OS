import { NotebookInfo, NotebookArtifact, Flashcard } from '@/types';

// ─── FRENTE A: INTEGRAÇÃO NOTEBOOKLM (VIA OAUTH) ───────────────────────────
// Atenção: A API pública do NotebookLM ainda não foi lançada oficialmente pelo Google.
// Estes endpoints são placeholders que retornarão erro 404 até que a API esteja disponível.
const NOTEBOOK_LM_API_BASE = 'https://notebooklm.googleapis.com/v1';

export const listNotebooks = async (accessToken: string): Promise<NotebookInfo[]> => {
  if (!accessToken) throw new Error("Token de acesso não fornecido.");
  
  try {
    const response = await fetch(`${NOTEBOOK_LM_API_BASE}/notebooks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      // Mocked fallback para não quebrar a UI enquanto a API não existe
      console.warn("API do NotebookLM indisponível. Usando mock.");
      return [
        { name: 'notebooks/mock-1', displayName: 'Caderno de Teste 1' }
      ];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Falha ao listar notebooks:', error);
    return [];
  }
};

export const fetchNotebookArtifacts = async (accessToken: string, notebookId: string): Promise<NotebookArtifact[]> => {
  if (!accessToken) throw new Error("Token de acesso não fornecido.");
  
  try {
    const response = await fetch(`${NOTEBOOK_LM_API_BASE}/${notebookId}/artifacts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn("API do NotebookLM indisponível. Usando mock.");
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Falha ao buscar artefatos do notebook ${notebookId}:`, error);
    return [];
  }
};

// ─── FRENTE B: GERAÇÃO NATIVA DIRETA VIA GEMINI API ────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const generateDirectArtifact = async (subjectContext: string, type: 'flashcard' | 'summary') => {
  if (!GEMINI_API_KEY) {
    throw new Error("Chave de API do Gemini não configurada (VITE_GEMINI_API_KEY).");
  }

  const prompt = type === 'flashcard'
    ? `Você é um professor experiente. Com base no seguinte conteúdo da matéria, crie os melhores flashcards possíveis para estudo ativo.
    
Retorne ESTRITAMENTE no formato JSON:
{
  "flashcards": [
    { "id": "uuid-aqui", "front": "Pergunta ou conceito chave", "back": "Resposta direta e explicativa" }
  ]
}

Conteúdo:
${subjectContext}`
    : `Você é um professor experiente. Crie um resumo bem estruturado e didático sobre o seguinte conteúdo. Use markdown (títulos, listas, negrito) para facilitar a leitura.

Conteúdo:
${subjectContext}`;

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          ...(type === 'flashcard' ? { responseMimeType: "application/json" } : {})
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro na API do Gemini: ${errText}`);
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResult) {
      throw new Error("Resposta vazia da API do Gemini.");
    }

    if (type === 'flashcard') {
      try {
        const parsed = JSON.parse(textResult);
        return parsed.flashcards as Flashcard[];
      } catch (e) {
        console.error("Falha ao fazer parse dos flashcards gerados:", textResult);
        throw new Error("O Gemini retornou um formato inválido de flashcards.");
      }
    } else {
      return textResult as string;
    }
  } catch (error) {
    console.error("Erro em generateDirectArtifact:", error);
    throw error;
  }
};
