import { useState, useEffect } from 'react';
import { 
  Sparkles, ExternalLink, BookOpen, CheckCircle2, RotateCcw, 
  ChevronLeft, ChevronRight, Layers, Presentation, Video, Image as ImageIcon,
  Loader2, RefreshCw, Link as LinkIcon, Headphones, FileText,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { cn } from '@/lib/utils';
import type { AcademicSubject, NotebookInfo, NotebookArtifact, Flashcard } from '@/types';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/authStore';
import { listNotebooks, fetchNotebookArtifacts, generateDirectArtifact } from '@/services/aiIntegrationService';

interface FlashcardsStudyModalProps {
  open: boolean;
  onClose: () => void;
  subject: AcademicSubject | null;
  collegeId?: string;
  onMarkReviewed?: () => void;
  isReviewedToday?: boolean;
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
  const updateSubject = useStore(state => state.updateSubject);
  const { googleAccessToken, connectGoogleAccount } = useAuthStore();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'summary'>('cards');

  // Estados Híbridos
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notebooks, setNotebooks] = useState<NotebookInfo[]>([]);
  const [isLoadingNotebooks, setIsLoadingNotebooks] = useState(false);
  const [remoteArtifacts, setRemoteArtifacts] = useState<NotebookArtifact[]>([]);
  const [isFetchingArtifacts, setIsFetchingArtifacts] = useState(false);

  // Estados Geração Nativa
  const [showNativeGenerator, setShowNativeGenerator] = useState(false);
  const [subjectContextText, setSubjectContextText] = useState(subject?.notes || '');
  const [isGeneratingNative, setIsGeneratingNative] = useState(false);
  const [nativeError, setNativeError] = useState('');

  if (!subject) return null;

  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      const result = await connectGoogleAccount();
      if (!result.success) {
        throw new Error(result.error || "Erro desconhecido ao conectar com Google.");
      }
    } catch (error: any) {
      console.error("Detalhes do erro OAuth:", error);
      alert(`Erro ao conectar com Google: ${error.message}`);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const loadNotebooks = async () => {
    if (!googleAccessToken) return;
    setIsDropdownOpen(true);
    setIsLoadingNotebooks(true);
    try {
      const data = await listNotebooks(googleAccessToken);
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
    if (!subject.notebookId || !googleAccessToken) return;
    setIsFetchingArtifacts(true);
    try {
      const data = await fetchNotebookArtifacts(googleAccessToken, subject.notebookId);
      setRemoteArtifacts(data);
    } catch (err) {
      console.error('Falha ao carregar artefatos do notebook', err);
    } finally {
      setIsFetchingArtifacts(false);
    }
  };

  useEffect(() => {
    if (subject?.notebookId && open && googleAccessToken) {
      loadArtifacts();
    }
  }, [subject?.notebookId, open, googleAccessToken]);

  const handleGenerateNative = async (type: 'flashcard' | 'summary') => {
    if (!subjectContextText.trim()) {
      setNativeError("Cole o conteúdo da matéria para gerar os artefatos.");
      return;
    }
    
    setIsGeneratingNative(true);
    setNativeError('');
    
    try {
      const result = await generateDirectArtifact(subjectContextText, type);
      
      if (collegeId && subject.id) {
        if (type === 'flashcard') {
          updateSubject(collegeId, subject.id, {
            artifacts: {
              ...subject.artifacts,
              generatedFlashcards: result as Flashcard[]
            }
          });
          setViewMode('cards');
        } else {
          updateSubject(collegeId, subject.id, {
            artifacts: {
              ...subject.artifacts,
              generatedSummary: result as string
            }
          });
          setViewMode('summary');
        }
      }
      
      setShowNativeGenerator(false);
    } catch (error: any) {
      console.error("Erro na geração:", error);
      setNativeError(error.message || "Falha ao gerar o artefato. Verifique sua chave de API.");
    } finally {
      setIsGeneratingNative(false);
    }
  };

  // Separa os flashcards (NotebookLM vs Nativo)
  const notebookFlashcards = remoteArtifacts
    .filter(a => a.type === 'flashcard')
    .map(f => ({ question: f.content || f.title, answer: f.backContent || '' }));
    
  const nativeFlashcards = (subject.artifacts?.generatedFlashcards || []).map(f => ({
    question: f.front,
    answer: f.back
  }));

  const cards = [...notebookFlashcards, ...nativeFlashcards];
  const currentCard = cards[currentCardIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const artifactsLegacy = subject.artifacts;

  return (
    <Modal open={open} onClose={onClose} title="Estudo Ativo & IA Integrada" size="lg">
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
              {viewMode === 'cards' ? 'Ver Resumos / Artefatos' : 'Modo Flashcards'}
            </button>
          </div>
        </div>

        {/* Integração IA: Modo Híbrido (NotebookLM + Nativo) */}
        <div className="flex flex-col gap-4 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-slate-800/40 to-slate-900/80 border border-indigo-500/20 relative overflow-hidden">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm tracking-wide">
            <Sparkles size={16} /> Central de Inteligência Artificial
          </div>

          {!googleAccessToken ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-slate-900/50 rounded-xl border border-white/5">
              <p className="text-xs text-slate-300">
                Conecte sua conta do Google para buscar cadernos do NotebookLM ou gerar flashcards e resumos avançados.
              </p>
              <button
                onClick={handleConnectGoogle}
                disabled={isConnectingGoogle}
                className="whitespace-nowrap px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isConnectingGoogle ? <Loader2 size={14} className="animate-spin" /> : null}
                {isConnectingGoogle ? "Conectando..." : "Conectar Conta Google (Gemini)"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {subject.notebookId ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg">
                      <BookOpen size={14} /> {subject.notebookName}
                    </span>
                    <button 
                      onClick={loadArtifacts}
                      disabled={isFetchingArtifacts}
                      className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                      title="Sincronizar Artefatos NotebookLM"
                    >
                      <RefreshCw size={14} className={cn(isFetchingArtifacts && "animate-spin")} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={loadNotebooks}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 px-3 py-2 rounded-lg transition-colors"
                    >
                      <LinkIcon size={14} /> Vincular Caderno NotebookLM
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-white/10 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Seus Cadernos</span>
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
                            <div className="p-3 text-center text-xs text-slate-500">Nenhum caderno encontrado</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => setShowNativeGenerator(!showNativeGenerator)}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-lg",
                    showNativeGenerator 
                      ? "bg-slate-700 text-white" 
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                  )}
                >
                  <Sparkles size={14} /> 
                  {showNativeGenerator ? "Ocultar Gerador de IA" : "Gerar Flashcards/Resumo (IA Nativa)"}
                </button>
              </div>

              {/* Área de Geração Nativa */}
              {showNativeGenerator && (
                <div className="flex flex-col gap-3 mt-2 p-4 bg-slate-900/60 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs text-slate-400">Cole abaixo o texto da matéria, transcrição de aula ou anotações para a IA processar:</p>
                  
                  <textarea
                    value={subjectContextText}
                    onChange={(e) => setSubjectContextText(e.target.value)}
                    placeholder="Cole o conteúdo aqui..."
                    className="w-full h-32 px-3 py-2 text-sm bg-slate-950 border border-white/10 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                  
                  {nativeError && (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-md">
                      <AlertCircle size={12} /> {nativeError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      onClick={() => handleGenerateNative('summary')}
                      disabled={isGeneratingNative || !subjectContextText.trim()}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isGeneratingNative ? <Loader2 size={14} className="animate-spin inline mr-1" /> : <FileText size={14} className="inline mr-1" />}
                      Gerar Resumo
                    </button>
                    <button
                      onClick={() => handleGenerateNative('flashcard')}
                      disabled={isGeneratingNative || !subjectContextText.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                    >
                      {isGeneratingNative ? <Loader2 size={14} className="animate-spin inline mr-1" /> : <Layers size={14} className="inline mr-1" />}
                      Gerar Flashcards
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conteúdo Principal */}
        {isFetchingArtifacts ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-xs text-slate-400 font-medium animate-pulse">Buscando artefatos...</p>
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
                  {isFlipped ? "Conceito revelado" : "Pense na resposta e clique para conferir"}
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
        ) : viewMode === 'cards' && cards.length === 0 ? (
           <div className="py-12 flex flex-col items-center justify-center text-center px-4">
             <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
               Nenhum flashcard encontrado. Use o botão <strong>Gerar Flashcards</strong> acima colando suas anotações!
             </p>
           </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              Resumos e Artefatos
            </h4>
            
            {/* Exibe o Resumo Gerado Nativamente (se existir) */}
            {subject.artifacts?.generatedSummary && (
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-indigo-500/20 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between text-indigo-300">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} />
                    <span className="text-sm font-semibold">Resumo (IA Nativa)</span>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto scrollbar-hide text-sm text-slate-200 whitespace-pre-wrap leading-relaxed mt-2 prose prose-invert prose-sm">
                  {subject.artifacts.generatedSummary}
                </div>
              </div>
            )}

            {subject.notebookId && remoteArtifacts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {remoteArtifacts.filter(a => a.type !== 'flashcard').map((artifact) => {
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

                  return null;
                })}
              </div>
            ) : artifactsLegacy?.flashcardsSummary && !subject.artifacts?.generatedSummary ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 max-h-60 overflow-y-auto scrollbar-hide">
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {artifactsLegacy.flashcardsSummary}
                </p>
              </div>
            ) : !subject.artifacts?.generatedSummary && remoteArtifacts.filter(a => a.type !== 'flashcard').length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Nenhum resumo encontrado. Use a Geração de IA acima.
              </p>
            ) : null}
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
