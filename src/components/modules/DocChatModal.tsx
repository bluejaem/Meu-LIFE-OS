import { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FileText, UploadCloud, MessageSquare, Loader2, Send, User, BrainCircuit } from 'lucide-react';
import { processPDF, DocumentChunk, retrieveRelevantChunks } from '@/lib/rag';
import { chatWithDocument } from '@/lib/gemini';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface DocChatModalProps {
  open: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export function DocChatModal({ open, onClose }: DocChatModalProps) {
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Reset state when closing/opening
  useEffect(() => {
    if (!open) {
      // Opcional: limpar estado ao fechar. Para manter a sessão, deixamos como está.
    }
  }, [open]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF.');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setChunks([]);
    setMessages([]);

    try {
      const resultChunks = await processPDF(file, (msg) => setProgressMsg(msg));
      setChunks(resultChunks);
      setProgressMsg('');
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: `Olá! Eu analisei o documento **${file.name}**. O que você gostaria de saber sobre ele?`
        }
      ]);
    } catch (error) {
      console.error(error);
      setProgressMsg('Erro ao processar o PDF. Verifique o console.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isChatting || chunks.length === 0) return;

    const userQuery = inputValue.trim();
    setInputValue('');
    
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userQuery
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsChatting(true);

    try {
      // 1. Recuperar chunks relevantes
      const relevantChunks = await retrieveRelevantChunks(userQuery, chunks, 3);
      
      // 2. Preparar histórico (simplificado)
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // 3. Fazer a query ao Gemini com os chunks injetados
      const responseText = await chatWithDocument(userQuery, relevantChunks, chatHistory);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Desculpe, ocorreu um erro ao processar sua pergunta.'
      }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Chat com Documento (PDF RAG)" size="lg">
      <div className="flex flex-col h-[600px]">
        {/* Header / Upload Area */}
        {!fileName ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 text-center bg-white/5 hover:bg-white/10 transition-colors">
            <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Faça upload de um PDF</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              O arquivo será processado e ficará na memória apenas durante esta sessão.
            </p>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
              {isProcessing ? 'Processando...' : 'Selecionar Arquivo'}
            </button>
            {isProcessing && (
              <p className="mt-4 text-xs text-indigo-300 font-medium animate-pulse">
                {progressMsg}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Context Info */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{fileName}</h4>
                  <p className="text-xs text-indigo-300/70">
                    {chunks.length} trechos indexados na memória
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setFileName(null);
                  setChunks([]);
                  setMessages([]);
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors underline"
              >
                Trocar Arquivo
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <MessageSquare size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">Envie uma mensagem para começar.</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.role === 'user' 
                      ? "bg-slate-700 text-slate-300" 
                      : "bg-indigo-500/20 text-indigo-400"
                  )}>
                    {msg.role === 'user' ? <User size={14} /> : <BrainCircuit size={14} />}
                  </div>
                  
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user'
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white/5 text-slate-200 border border-white/10 rounded-tl-none prose prose-invert prose-p:leading-snug prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10"
                  )}>
                    {msg.role === 'user' ? (
                      msg.text
                    ) : (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {isChatting && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <BrainCircuit size={14} />
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-indigo-400" />
                    <span className="text-xs text-indigo-300">Analisando documento...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative shrink-0">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre o documento..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none h-[52px]"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isChatting}
                className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
