import { useState } from 'react';
import { 
  GraduationCap, Sparkles, BookOpen, Layers, CheckCircle2, 
  ArrowRight, Presentation, Video, Image as ImageIcon,
  Flame, Check, RotateCcw
} from 'lucide-react';
import { useAcademicStore } from '@/store/useAcademicStore';
import { cn } from '@/lib/utils';
import type { AcademicSubject } from '@/types';
import { FlashcardsStudyModal } from './FlashcardsStudyModal';

interface ActiveReviewWidgetProps {
  setActiveTab?: (tab: string) => void;
}

export function ActiveReviewWidget({ setActiveTab }: ActiveReviewWidgetProps) {
  const { subjects, toggleReviewStatus } = useAcademicStore();
  const [selectedSubject, setSelectedSubject] = useState<AcademicSubject | null>(null);
  const [viewMode, setViewMode] = useState<'pending' | 'all'>('pending');

  const pendingSubjects = subjects.filter(s => s.activeReviewPending);
  const completedSubjects = subjects.filter(s => !s.activeReviewPending);
  const displayedSubjects = viewMode === 'pending' ? pendingSubjects : subjects;

  const totalCount = subjects.length;
  const pendingCount = pendingSubjects.length;
  const completedCount = completedSubjects.length;
  const completionPercentage = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 100;

  return (
    <div className="glass-panel p-5 relative overflow-hidden border border-white/10 rounded-2xl flex flex-col gap-4 shadow-xl shrink-0">
      {/* Luz ambiente temática */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header do Widget */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/10">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Revisão Ativa & Flashcards IA
                <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  <Sparkles size={10} className="text-amber-400" /> Gemini Pro
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Hub Acadêmico · Combate à procrastinação com estudo ativo diário
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <span className="text-xs font-bold text-white block">
              {completedCount} / {totalCount} concluídas
            </span>
            <span className="text-[10px] text-slate-500">
              {pendingCount === 0 ? "Meta diária batida!" : `${pendingCount} pendente${pendingCount > 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="w-11 h-11 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={cn(
                  "transition-all duration-700 ease-out",
                  pendingCount === 0 ? "text-emerald-400" : "text-indigo-500"
                )}
                strokeDasharray={`${completionPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-white">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Link para o Hub Completo */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-black/25 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setViewMode('pending')}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
              viewMode === 'pending'
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Flame size={12} className={pendingCount > 0 ? "text-amber-400 animate-pulse" : "text-slate-500"} />
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
              viewMode === 'all'
                ? "bg-white/15 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Todas ({totalCount})
          </button>
        </div>

        {setActiveTab && (
          <button
            onClick={() => setActiveTab('academic-hub')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline transition-colors"
          >
            Hub Acadêmico Completo <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Lista de Matérias com Ações Rápidas de IA */}
      <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto scrollbar-hide pr-1">
        {displayedSubjects.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {totalCount === 0 ? "Nenhuma disciplina cadastrada" : "Tudo em dia! Nenhuma revisão ativa pendente hoje."}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {totalCount === 0 
                  ? "Acesse o Hub Acadêmico Completo para vincular notebooks e adicionar flashcards."
                  : "Você fixou todos os conceitos principais das suas disciplinas."}
              </p>
            </div>
            <button
              onClick={() => setViewMode('all')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-1"
            >
              Ver todas as disciplinas
            </button>
          </div>
        ) : (
          displayedSubjects.map((sub) => {
            const isPending = sub.activeReviewPending;
            const artifacts = sub.artifacts;



            return (
              <div
                key={sub.id}
                className={cn(
                  "p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group select-none",
                  isPending
                    ? "bg-white/[0.03] border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.05]"
                    : "bg-emerald-500/[0.03] border-emerald-500/20 hover:border-emerald-500/30"
                )}
              >
                {/* Metadados e Título */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    )}>
                      {sub.institution}
                    </span>

                    {sub.semester && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {sub.semester}
                      </span>
                    )}

                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
                      isPending
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    )}>
                      {isPending ? (
                        <>
                          <Flame size={10} className="text-amber-400" /> Pendente Hoje
                        </>
                      ) : (
                        <>
                          <Check size={10} className="text-emerald-400" /> Revisado
                        </>
                      )}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                    {sub.name}
                  </h4>

                  {sub.notes && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                      {sub.notes}
                    </p>
                  )}
                </div>

                {/* Botões de Acesso Rápido a Artefatos IA & Ação de Revisão */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                  
                  {/* Gemini Notebook */}
                  {(sub.notebookUrl || artifacts?.notebookUrl) && (
                    <a
                      href={sub.notebookUrl || artifacts?.notebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-colors"
                      title="Abrir Gemini Notebook"
                    >
                      <BookOpen size={14} />
                    </a>
                  )}

                  {/* Flashcards */}
                  <button
                    onClick={() => setSelectedSubject(sub)}
                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-all"
                    title="Praticar Flashcards Ativos"
                  >
                    <Layers size={13} />
                    <span>Flashcards</span>
                  </button>

                  {/* Slides */}
                  {artifacts?.slidesUrl && (
                    <a
                      href={artifacts.slidesUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors"
                      title="Ver Slides de IA"
                    >
                      <Presentation size={14} />
                    </a>
                  )}

                  {/* Roteiro */}
                  {artifacts?.videoScriptUrl && (
                    <a
                      href={artifacts.videoScriptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors"
                      title="Ver Roteiro de Vídeo"
                    >
                      <Video size={14} />
                    </a>
                  )}

                  {/* Infográfico */}
                  {artifacts?.infographicUrl && (
                    <a
                      href={artifacts.infographicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 transition-colors"
                      title="Ver Infográfico"
                    >
                      <ImageIcon size={14} />
                    </a>
                  )}

                  {/* Botão Concluir / Desmarcar Revisão */}
                  <button
                    onClick={() => toggleReviewStatus(sub.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-300 shadow-sm",
                      isPending
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-indigo-600/20"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                    )}
                    title={isPending ? "Concluir revisão diária desta matéria" : "Reabrir para revisão"}
                  >
                    {isPending ? (
                      <>
                        <Check size={13} />
                        <span>Concluir Revisão</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw size={13} className="text-emerald-400" />
                        <span className="hidden sm:inline">Concluída</span>
                      </>
                    )}
                  </button>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Interativo de Flashcards */}
      {selectedSubject && (
        <FlashcardsStudyModal
          open={!!selectedSubject}
          onClose={() => setSelectedSubject(null)}
          subject={selectedSubject}
          isReviewedToday={!selectedSubject.activeReviewPending}
          onMarkReviewed={() => {
            if (selectedSubject.activeReviewPending) {
              toggleReviewStatus(selectedSubject.id);
            }
            setSelectedSubject(null);
          }}
        />
      )}
    </div>
  );
}
