import { GoogleGenAI } from '@google/genai';

// Função auxiliar para inicializar o cliente
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY');
  
  if (!apiKey) {
    console.error("API Key do Gemini não encontrada. Configure VITE_GEMINI_API_KEY no .env.local ou defina GEMINI_API_KEY no localStorage.");
    return null;
  }

  // O package.json deve usar import dinâmico/condicional ou o próprio SDK lida com as chaves via construtor.
  return new GoogleGenAI({ apiKey });
}

export async function evaluateFeynmanExplanation(subject: string, explanation: string): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    return "Erro: Chave da API do Gemini não configurada. Por favor, adicione VITE_GEMINI_API_KEY no arquivo .env.local e reinicie a aplicação.";
  }

  const prompt = `
Você é um especialista altamente didático usando a Técnica de Feynman para avaliar o aprendizado do usuário.
O usuário está tentando explicar o conceito de "${subject}".

Explicação do usuário:
"${explanation}"

Sua tarefa:
1. Avalie a explicação como se você fosse uma pessoa leiga ou um professor avaliando a clareza e precisão.
2. Identifique jargões que não foram bem explicados.
3. Aponte possíveis lacunas no entendimento ou inconsistências.
4. Faça 1 ou 2 perguntas socráticas instigantes para fazer o usuário refletir mais profundamente sobre o tema.

Seja direto, gentil, e use o idioma português (PT-BR). Retorne a resposta em Markdown bem formatado.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7
      }
    });

    return response.text || "Não foi possível gerar uma resposta.";
  } catch (error: any) {
    console.error("Erro ao chamar o Gemini API:", error);
    return `Erro na API: ${error.message}`;
  }
}
