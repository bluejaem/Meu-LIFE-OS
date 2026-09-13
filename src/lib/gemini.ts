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

export async function generateEmbedding(text: string): Promise<number[]> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("Chave da API do Gemini não configurada.");
  }

  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });
    return response.embeddings?.[0]?.values || [];
  } catch (error: any) {
    console.error("Erro ao gerar embedding:", error);
    return [];
  }
}

export async function chatWithDocument(query: string, contextChunks: string[], chatHistory: { role: string; parts: { text: string }[] }[] = []): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    return "Erro: Chave da API do Gemini não configurada.";
  }

  const systemInstruction = `
Você é um assistente acadêmico ajudando o usuário a entender um documento em PDF que ele carregou.
Responda APENAS com base nos trechos do documento fornecidos abaixo.
Se a resposta não estiver nos trechos, diga educadamente que o documento não contém essa informação. Não invente dados.
Seja claro, didático e cite partes do documento se for útil.

TRECHOS DO DOCUMENTO:
${contextChunks.map((chunk, index) => `[Trecho ${index + 1}]:\n${chunk}`).join('\n\n')}
  `.trim();

  try {
    // Restaurar o histórico de mensagens, se houver
    if (chatHistory.length > 0) {
      // Nota: o SDK do @google/genai aceita um array de mensagens no history ao criar o chat, 
      // ou podemos enviá-las individualmente. Vamos tentar enviar a query diretamente se o SDK não suportar init com history facilmente,
      // mas o ideal seria inicializar o chat com o history.
    }

    // Por simplicidade na V2 do SDK, se precisarmos de histórico, podemos concatenar ou enviar tudo como contents.
    // Como a API v2 mudou um pouco, o jeito mais seguro de manter contexto de RAG é enviar tudo na mensagem atual ou init.
    // Vamos usar o método generateContent direto com as mensagens combinadas se não conseguirmos setar o history no create().
    
    // Na verdade, @google/genai ai.chats.create aceita history: Message[]
    const chatWithHistory = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      },
      history: chatHistory.length > 0 ? chatHistory : undefined
    });

    const response = await chatWithHistory.sendMessage({ message: query });
    return response.text || "Sem resposta.";

  } catch (error: any) {
    console.error("Erro no RAG Gemini:", error);
    return `Erro na API: ${error.message}`;
  }
}
