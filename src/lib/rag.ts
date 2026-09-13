import * as pdfjsLib from 'pdfjs-dist';
import { generateEmbedding } from './gemini';

// Configure the worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export interface DocumentChunk {
  text: string;
  embedding?: number[];
}

/**
 * Extract text from a PDF File object using pdfjs-dist
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText;
}

/**
 * Split text into smaller chunks with overlap
 */
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  
  while (i < text.length) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);
    i += chunkSize - overlap;
  }
  
  return chunks;
}

/**
 * Process a PDF file: extract text, chunk it, and generate embeddings for each chunk
 */
export async function processPDF(file: File, onProgress?: (msg: string) => void): Promise<DocumentChunk[]> {
  onProgress?.('Extraindo texto do PDF...');
  const text = await extractTextFromPDF(file);
  
  onProgress?.('Dividindo texto em partes (chunking)...');
  const textChunks = chunkText(text);
  
  const documentChunks: DocumentChunk[] = [];
  
  onProgress?.(`Gerando embeddings para ${textChunks.length} partes... Isso pode levar um tempo.`);
  // Para evitar limite de taxa (rate limiting), podemos processar em lotes menores
  // Como é Client-Side, vamos fazer um por vez ou pequenos lotes
  for (let i = 0; i < textChunks.length; i++) {
    const chunk = textChunks[i];
    onProgress?.(`Gerando embedding ${i + 1} de ${textChunks.length}...`);
    try {
      const embedding = await generateEmbedding(chunk);
      documentChunks.push({
        text: chunk,
        embedding
      });
      
      // Delay artificial para evitar rate limiting da API gratuita (opcional)
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {
      console.error('Erro ao gerar embedding do chunk', i, e);
    }
  }
  
  return documentChunks;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Retrieve the top K most relevant chunks for a given query
 */
export async function retrieveRelevantChunks(query: string, chunks: DocumentChunk[], topK: number = 3): Promise<string[]> {
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding || queryEmbedding.length === 0) {
    return [];
  }
  
  // Calcular similaridade
  const scoredChunks = chunks.map(chunk => ({
    text: chunk.text,
    score: chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0
  }));
  
  // Ordenar por score descrescente
  scoredChunks.sort((a, b) => b.score - a.score);
  
  // Pegar os top K
  return scoredChunks.slice(0, topK).map(c => c.text);
}
