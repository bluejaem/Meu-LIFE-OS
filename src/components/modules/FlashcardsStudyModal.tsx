import { useState, useEffect } from 'react';
import { 
  Sparkles, ExternalLink, BookOpen, CheckCircle2, RotateCcw, 
  ChevronLeft, ChevronRight, Layers, Presentation, Video, Image as ImageIcon,
  Loader2, RefreshCw, Link as LinkIcon
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { cn } from '@/lib/utils';
import type { AcademicSubject, NotebookInfo } from '@/types';
import { useStore } from '@/store/useStore';
import { fetchNotebooks, fetchNotebookFlashcards, Flashcard } from '@/services/notebookService';

interface FlashcardsStudyModalProps {
  open: boolean;
  onClose: () => void;
  subject: AcademicSubject | null;
  collegeId?: string;
  onMarkReviewed?: () => void;
  isReviewedToday?: boolean;
}

interface ParsedCard {
  question: string;
  answer: string;
}

export function FlashcardsStudyModal({
  open,
  onClose,
  subject,
  collegeId,
  onMarkReviewed,
  isReviewedToday
}: FlashcardsStudyModalProps) {
  const linkNotebookToSubject = useStore(state => state.linkNotebookToSubject);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'summary'>('cards');

  // Estados do NotebookLM
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notebooks, setNotebooks] = useState<NotebookInfo[]>([]);
  const [isLoadingNotebooks, setIsLoadingNotebooks] = useState(false);
  const [remoteFlashcards, setRemoteFlashcards] = useState<Flashcard[]>([]);
  const [isFetchingFlashcards, setIsFetchingFlashcards] = useState(false);

  if (!subject) return null;

  // Parser dos flashcards a partir do texto do resumo
  const parseFlashcards = (text?: string): ParsedCard[] => {
    if (!text) return [];
    
    // Suporte a formatos "1. Pergunta? Resposta" ou "Q: ... A: ..." ou linhas separadas
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const cards: ParsedCard[] = [];

    lines.forEach((line) => {
      // Procura por "? " ou ":" para dividir pergunta e resposta
      const questionMarkIdx = line.indexOf('?');
      if (questionMarkIdx !== -1) {
        const question = line.substring(0, questionMarkIdx + 1).replace(/^(\d+[\.\)]|\-|\*)\s*/, '').trim();
        const answer = line.substring(questionMarkIdx + 1).trim();
        if (question && answer) {
          cards.push({ question, answer });
          return;
        }
      }

      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1 && colonIdx < 40) {
        const question = line.substring(0, colonIdx).replace(/^(\d+[\.\)]|\-|\*)\s*/, '').trim();
        const answer = line.substring(colonIdx + 1).trim();
        if (question && answer) {
          cards.push({ question, answer });
          return;
        }
      }

      // Fallback: cartão único
      cards.push({
        question: `Conceito ${cards.length + 1}`,
        answer: line.replace(/^(\d+[\.\)]|\-|\*)\s*/, '')
      });
    });

    return cards;
  };

  const loadNotebooks = async () => {
    setIsDropdownOpen(true);
    setIsLoadingNotebooks(true);
    try {
      const data = await fetchNotebooks();
      setNotebooks(data);
    } catch (err) {
      console.error('Falha ao carregar notebooks', err);
    } finally {
      setIsLoadingNotebooks(false);
    }
  };

  const handleLinkNotebook = async (notebookId: string, notebookName: string) => {
    if (collegeId && subject.id) {
      await linkNotebookToSubject(collegeId, subject.id, notebookId, notebookName);
    }
    setIsDropdownOpen(false);
  };

  const loadFlashcards = async () => {
    if (!subject.notebookId) return;
    setIsFetchingFlashcards(true);
    try {
      const data = await fetchNotebookFlashcards(subject.notebookId);
      setRemoteFlashcards(data);
    } catch (err) {
      console.error('Falha ao carregar flashcards do notebook', err);
    } finally {
      setIsFetchingFlashcards(false);
    }
  };

  useEffect(() => {
    if (subject?.notebookId && open) {
      loadFlashcards();
    }
  }, [subject?.notebookId, open]);

  // Use flashcards remotos se existirem, senão faça parse do texto manual
  const cards = remoteFlashcards.length > 0 
    ? remoteFlashcards.map(f => ({ question: f.front, answer: f.back }))
    : parseFlashcards(subject.aiArtifacts?.flashcardsSummary);
    
  const currentCard = cards[currentCardIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const artifacts = subject.aiArtifacts;

  return (
    <Modal open={open} onClose={onClose} title="Estudo Ativo & Flashcards IA" size="lg">
      <div className="flex flex-col gap-5">
        
        {/* Header com Metadados da Matéria */}
        <div className="flex items-start justify-between pb-3 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {subject.institution && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {subject.institution}
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium">Progresso: {subject.progress}%</span>
            </div>
            <h3 className="text-base font-bold text-white leading-snug">{subject.name}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'summary' : 'cards')}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors"
            >
              {viewMode === 'cards' ? 'Ver Texto Completo' : 'Modo Flashcards'}
            </button>
          </div>
        </div>

        {/* Barra de Acesso Rápido a Artefatos de IA do Gemini Notebook */}
        <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl bg-white/[0.03] border border-white/5 relative">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Sparkles size={12} className="text-indigo-400" />
            Artefatos IA:
          </span>

          {subject.notebookId ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg shadow-sm">
                <BookOpen size={12} /> {subject.notebookName}
              </span>
              <button 
                onClick={loadFlashcards}
                disabled={isFetchingFlashcards}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Recarregar flashcards"
              >
                <RefreshCw size={14} className={cn(isFetchingFlashcards && "animate-spin")} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={loadNotebooks}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <LinkIcon size={12} /> Vincular Notebook Gemini
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Seus Notebooks</span>
                    {isLoadingNotebooks && <Loader2 size={12} className="animate-spin text-indigo-400" />}
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1 scrollbar-hide">
                    {notebooks.map(nb => (
                      <button
                        key={nb.name}
                        onClick={() => handleLinkNotebook(nb.name, nb.displayName)}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {nb.displayName}
                      </button>
                    ))}
                    {!isLoadingNotebooks && notebooks.length === 0 && (
                      <div className="p-3 text-center text-xs text-slate-500">Nenhum notebook encontrado</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {subject.notebookUrl && !subject.notebookId && (
            <a
              href={subject.notebookUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink size={12} /> Acessar Link Manual
            </a>
          )}

          {artifacts?.slidesUrl && (
            <a
              href={artifacts.slidesUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Presentation size={12} /> Slides
            </a>
          )}

          {artifacts?.videoScriptUrl && (
            <a
              href={artifacts.videoScriptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Video size={12} /> Roteiro
            </a>
          )}

          {artifacts?.infographicUrl && (
            <a
              href={artifacts.infographicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ImageIcon size={12} /> Infográfico
            </a>
          )}
        </div>

        {/* Conteúdo: Cartões Interativos vs Resumo Textual */}
        {isFetchingFlashcards ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-xs text-slate-400 font-medium animate-pulse">Sincronizando com o Gemini Notebook...</p>
          </div>
        ) : viewMode === 'cards' && cards.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Layers size={13} className="text-indigo-400" />
                Cartão {currentCardIndex + 1} de {cards.length}
              </span>
              <span className="text-[11px] text-slate-500">Clique no cartão para virar</span>
            </div>

            {/* Cartão de Flashcard Flip/Interativo */}
            {currentCard && (
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={cn(
                  "w-full min-h-[200px] p-6 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between border relative overflow-hidden group select-none shadow-xl",
                  isFlipped
                    ? "bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/60 border-indigo-500/40 shadow-indigo-500/10"
                    : "bg-gradient-to-br from-slate-900/80 via-slate-800/40 to-slate-900/80 border-white/10 hover:border-white/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                    isFlipped ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20"
                  )}>
                    {isFlipped ? "Resposta / Conceito" : "Pergunta / Desafio"}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 group-hover:text-slate-300 transition-colors">
                    <RotateCcw size={12} /> {isFlipped ? "Ver pergunta" : "Ver resposta"}
                  </span>
                </div>

                <div className="my-auto py-4">
                  <p className={cn(
                    "text-center font-medium leading-relaxed transition-all",
                    isFlipped ? "text-slate-100 text-base" : "text-white text-lg font-semibold"
                  )}>
                    {isFlipped ? currentCard.answer : currentCard.question}
                  </p>
                </div>

                <div className="flex items-center justify-center text-[11px] text-slate-500">
                  {isFlipped ? "Conceito revelado com IA" : "Pense na resposta e clique para conferir"}
                </div>
              </div>
            )}

            {/* Controles de Navegação */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={cards.length <= 1}
                className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Anterior
              </button>

              <div className="flex gap-1 flex-wrap justify-center max-w-[200px]">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setIsFlipped(false); setCurrentCardIndex(i); }}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === currentCardIndex ? "w-5 bg-indigo-500" : "bg-white/20 hover:bg-white/40"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={cards.length <= 1}
                className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Próximo <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 max-h-60 overflow-y-auto scrollbar-hide">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              Resumo & Flashcards da Matéria
            </h4>
            
            {subject.notebookId && remoteFlashcards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {remoteFlashcards.map((f, i) => (
                  <div key={f.id || i} className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-indigo-500/30 transition-colors group">
                    <p className="text-xs font-semibold text-indigo-300 mb-2">P: {f.front}</p>
                    <p className="text-sm text-slate-200 group-hover:text-white transition-colors">R: {f.back}</p>
                  </div>
                ))}
              </div>
            ) : subject.aiArtifacts?.flashcardsSummary ? (
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {subject.aiArtifacts.flashcardsSummary}
              </p>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Nenhum flashcard ou resumo cadastrado para esta matéria ainda. Vincule um Notebook ou edite a matéria no módulo acadêmico para adicionar.
              </p>
            )}
          </div>
        )}

        {/* Ação de Conclusão / Revisão Ativa */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-2.5 h-2.5 rounded-full",
              isReviewedToday ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
            )} />
            <span className="text-xs text-slate-400">
              {isReviewedToday ? "Revisão do dia concluída!" : "Pendente para revisão hoje"}
            </span>
          </div>

          {onMarkReviewed && (
            <button
              onClick={onMarkReviewed}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-lg",
                isReviewedToday
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              )}
            >
              <CheckCircle2 size={14} />
              {isReviewedToday ? "Revisado Hoje ✓" : "Marcar como Revisado Hoje"}
            </button>
          )}
        </div>

      </div>
    </Modal>
  );
}
