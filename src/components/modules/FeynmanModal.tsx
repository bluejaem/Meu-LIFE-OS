import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { BrainCircuit, Loader2, Send } from 'lucide-react';
import { evaluateFeynmanExplanation } from '@/lib/gemini';
import ReactMarkdown from 'react-markdown';

interface FeynmanModalProps {
  open: boolean;
  onClose: () => void;
  subjectName: string;
}

export function FeynmanModal({ open, onClose, subjectName }: FeynmanModalProps) {
  const [explanation, setExplanation] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!explanation.trim()) return;
    setIsLoading(true);
    setFeedback(null);
    try {
      const response = await evaluateFeynmanExplanation(subjectName, explanation);
      setFeedback(response);
    } catch (e) {
      setFeedback("Ocorreu um erro ao conectar com o Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Técnica de Feynman: ${subjectName}`} size="lg">
      <div className="flex flex-col gap-4">
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-3">
          <BrainCircuit className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-100">
            Explique o conceito de <strong>{subjectName}</strong> em termos simples. O "Professor IA" avaliará sua clareza, possíveis jargões e apontará lacunas no seu entendimento.
          </p>
        </div>

        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder={`Digite sua explicação sobre ${subjectName} aqui...`}
          className="w-full h-40 px-4 py-3 text-sm bg-slate-900 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none shadow-inner"
          disabled={isLoading}
        />

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !explanation.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/20"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isLoading ? "Avaliando..." : "Enviar Explicação"}
          </button>
        </div>

        {feedback && (
          <div className="mt-4 p-5 rounded-xl border border-white/10 bg-black/40">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Feedback do Professor IA</h4>
            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 text-slate-300">
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
