import { useState, useEffect } from 'react';
import { 
  Sparkles, ExternalLink, BookOpen, CheckCircle2, RotateCcw, 
  ChevronLeft, ChevronRight, Layers, Presentation, Video, Image as ImageIcon,
  Loader2, RefreshCw, Link as LinkIcon, Headphones, FileText
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { cn } from '@/lib/utils';
import type { AcademicSubject, NotebookInfo, NotebookArtifact } from '@/types';
import { useStore } from '@/store/useStore';
import { fetchNotebooks, fetchNotebookArtifacts } from '@/services/notebookService';

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
  const [remoteArtifacts, setRemoteArtifacts] = useState<NotebookArtifact[]>([]);
  const [isFetchingArtifacts, setIsFetchingArtifacts] = useState(false);

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

  const loadArtifacts = async () => {
    if (!subject.notebookId) return;
    setIsFetchingArtifacts(true);
    try {
      const data = await fetchNotebookArtifacts(subject.notebookId);
      setRemoteArtifacts(data);
    } catch (err) {
      console.error('Falha ao carregar artefatos do notebook', err);
    } finally {
      setIsFetchingArtifacts(false);
    }
  };

  useEffect(() => {
    if (subject?.notebookId && open) {
      loadArtifacts();
    }
  }, [subject?.notebookId, open]);

  // Separa os flashcards dos outros artefatos para o modo "cards"
  const flashcardArtifacts = remoteArtifacts.filter(a => a.type === 'flashcard');

  // Use flashcards remotos se existirem, senão faça parse do texto manual
  const cards = flashcardArtifacts.length > 0 
    ? flashcardArtifacts.map(f => ({ question: f.content || f.title, answer: f.backContent || '' }))
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

  const artifactsLegacy = subject.aiArtifacts;

  return (
    <Modal open={open} onClose={onClose} title="Estudo Ativo & Artefatos IA" size="lg">
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
              {viewMode === 'cards' ? 'Ver Todos Artefatos' : 'Modo Flashcards'}
            </button>
          </div>
        </div>

        {/* Barra de Acesso Rápido a Artefatos de IA do Gemini Notebook */}
        <div className="flex flex-col gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 relative">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-400" />
              Integração Gemini:
            </span>

            {subject.notebookId ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg shadow-sm">
                  <BookOpen size={12} /> {subject.notebookName}
                </span>
                
                <a
                  href={`https://notebooklm.google.com/notebook/${subject.notebookId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink size={14} /> Abrir no Gemini Notebook
                </a>

                <button 
                  onClick={loadArtifacts}
                  disabled={isFetchingArtifacts}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                  title="Recarregar artefatos"
                >
                  <RefreshCw size={14} className={cn(isFetchingArtifacts && "animate-spin")} />
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
                  <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
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
          </div>
          
          {/* Legacy Artifacts (apenas se não houver notebookId e tiver artefatos antigos) */}
          {!subject.notebookId && (artifactsLegacy?.slidesUrl || artifactsLegacy?.videoScriptUrl || artifactsLegacy?.infographicUrl) && (
            <div className="flex gap-2 flex-wrap pt-2 border-t border-white/5">
               {artifactsLegacy?.slidesUrl && (
                <a href={artifactsLegacy.slidesUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2.5 py-1.5 rounded-lg transition-colors">
                  <Presentation size={12} /> Slides
                </a>
              )}
              {artifactsLegacy?.videoScriptUrl && (
                <a href={artifactsLegacy.videoScriptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1.5 rounded-lg transition-colors">
                  <Video size={12} /> Roteiro
                </a>
              )}
              {artifactsLegacy?.infographicUrl && (
                <a href={artifactsLegacy.infographicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 px-2.5 py-1.5 rounded-lg transition-colors">
                  <ImageIcon size={12} /> Infográfico
                </a>
              )}
            </div>
          )}
        </div>

        {/* Conteúdo Principal */}
        {isFetchingArtifacts ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-xs text-slate-400 font-medium animate-pulse">Sincronizando artefatos...</p>
          </div>
        ) : remoteArtifacts.length === 0 && subject.notebookId ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4">
             <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
               Nenhum artefato encontrado. Adicione suas fontes e clique em 'Abrir no Gemini Notebook' para gerar seus resumos, podcasts e flashcards.
             </p>
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
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              Todos os Artefatos Gerados
            </h4>
            
            {subject.notebookId && remoteArtifacts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {remoteArtifacts.map((artifact) => {
                  if (artifact.type === 'audio') {
                    return (
                      <div key={artifact.id} className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-indigo-300 mb-3">
                          <Headphones size={16} />
                          <span className="text-sm font-semibold">{artifact.title}</span>
                        </div>
                        {artifact.mediaUrl && (
                          <audio controls src={artifact.mediaUrl} className="w-full h-10 rounded-lg outline-none" />
                        )}
                      </div>
                    );
                  }
                  
                  if (artifact.type === 'summary' || artifact.type === 'note') {
                    return (
                      <div key={artifact.id} className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-indigo-300">
                          <FileText size={16} />
                          <span className="text-sm font-semibold">{artifact.title}</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto scrollbar-hide text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {artifact.content}
                        </div>
                      </div>
                    );
                  }

                  if (artifact.type === 'video' || artifact.type === 'presentation' || artifact.type === 'infographic') {
                    return (
                      <div key={artifact.id} className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-300">
                          {artifact.type === 'video' ? <Video size={16} /> : artifact.type === 'presentation' ? <Presentation size={16} /> : <ImageIcon size={16} />}
                          <span className="text-sm font-semibold">{artifact.title}</span>
                        </div>
                        {artifact.mediaUrl && (
                          <a
                            href={artifact.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <ExternalLink size={12} /> Abrir {artifact.type}
                          </a>
                        )}
                      </div>
                    );
                  }

                  if (artifact.type === 'flashcard') {
                    return (
                      <div key={artifact.id} className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col gap-2 border-l-2 border-l-indigo-500">
                        <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                          Flashcard
                        </div>
                        <p className="text-sm font-medium text-slate-200">P: {artifact.content || artifact.title}</p>
                        <p className="text-sm text-slate-400">R: {artifact.backContent}</p>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            ) : artifactsLegacy?.flashcardsSummary ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 max-h-60 overflow-y-auto scrollbar-hide">
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {artifactsLegacy.flashcardsSummary}
                </p>
              </div>
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

