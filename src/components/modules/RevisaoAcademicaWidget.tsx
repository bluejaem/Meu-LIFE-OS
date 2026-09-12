import { useState } from 'react';
import { 
  GraduationCap, Sparkles, BookOpen, Layers, CheckCircle2, 
  ArrowRight, Presentation, Video, Image as ImageIcon,
  Flame, Check
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import type { AcademicSubject } from '@/types';
import { FlashcardsStudyModal } from './FlashcardsStudyModal';

interface RevisaoAcademicaWidgetProps {
  setActiveTab?: (tab: string) => void;
  variant?: 'dashboard' | 'compact';
}

export function RevisaoAcademicaWidget({ setActiveTab, variant = 'dashboard' }: RevisaoAcademicaWidgetProps) {
  const { colleges, toggleSubjectReviewedToday } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [selectedSubject, setSelectedSubject] = useState<{
    subject: AcademicSubject;
    collegeId: string;
  } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Agrega todas as matérias de todas as faculdades cadastradas
  const allSubjects = colleges.flatMap(col => 
    col.subjects.map(subj => ({
      ...subj,
      collegeId: col.id,
      collegeName: col.name,
      institution: subj.institution || col.name,
      isReviewedToday: subj.lastReviewedDate === todayStr
    }))
  );

  const reviewedTodayCount = allSubjects.filter(s => s.isReviewedToday).length;
  const totalSubjectsCount = allSubjects.length;
  const reviewPercentage = totalSubjectsCount > 0 
    ? Math.round((reviewedTodayCount / totalSubjectsCount) * 100) 
    : 0;

  const filteredSubjects = allSubjects.filter(subj => {
    if (filter === 'pending') return !subj.isReviewedToday;
    if (filter === 'reviewed') return subj.isReviewedToday;
    return true;
  });

  return (
    <div className={cn(
      "glass-panel p-5 relative overflow-hidden border border-white/10 rounded-2xl flex flex-col gap-4",
      variant === 'compact' ? "p-4" : "p-6"
    )}>
      {/* Brilho decorativo sutil de fundo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

      {/* Header do Widget */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Revisão Ativa & Flashcards IA
                <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  <Sparkles size={10} className="text-amber-400" /> Gemini Pro
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Hub Acadêmico · Ecossistema de estudos e combate à procrastinação
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Indicador de Meta do Dia */}
          <div className="text-right">
            <span className="text-xs font-bold text-white block">
              {reviewedTodayCount} / {totalSubjectsCount} revisadas
            </span>
            <span className="text-[10px] text-slate-500">
              {reviewPercentage === 100 ? "Meta atingida!" : "Meta diária"}
            </span>
          </div>

          <div className="w-12 h-12 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-500 transition-all duration-700 ease-out"
                strokeDasharray={`${reviewPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-white">
              {reviewPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
              filter === 'all' ? "bg-white/15 text-white shadow" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Todas ({allSubjects.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
              filter === 'pending' ? "bg-amber-500/20 text-amber-300 shadow border border-amber-500/30" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Pendentes ({allSubjects.filter(s => !s.isReviewedToday).length})
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
              filter === 'reviewed' ? "bg-emerald-500/20 text-emerald-300 shadow border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Revisadas ({reviewedTodayCount})
          </button>
        </div>

        {setActiveTab && (
          <button
            onClick={() => setActiveTab('faculdades')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline transition-colors"
          >
            Hub Acadêmico <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Lista de Matérias Ativas com Ações de IA */}
      <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto scrollbar-hide pr-1">
        {filteredSubjects.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
            <CheckCircle2 size={32} className="text-emerald-400/60" />
            <p className="text-xs font-medium">
              {filter === 'pending' 
                ? "Nenhuma matéria pendente de revisão para hoje! Parabéns pelo foco." 
                : "Nenhuma disciplina cadastrada neste filtro."}
            </p>
          </div>
        ) : (
          filteredSubjects.map(subj => {
            const hasFlashcards = !!subj.aiArtifacts?.flashcardsSummary;
            const hasNotebook = !!subj.notebookUrl;
            const hasSlides = !!subj.aiArtifacts?.slidesUrl;
            const hasVideo = !!subj.aiArtifacts?.videoScriptUrl;
            const hasInfographic = !!subj.aiArtifacts?.infographicUrl;

            return (
              <div
                key={`${subj.collegeId}-${subj.id}`}
                className={cn(
                  "p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group",
                  subj.isReviewedToday
                    ? "bg-emerald-500/[0.04] border-emerald-500/20 hover:border-emerald-500/30"
                    : "bg-white/[0.03] border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.05]"
                )}
              >
                {/* Informações da Matéria */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    )}>
                      {subj.institution || subj.collegeName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Progresso: {subj.progress}%
                    </span>
                    {subj.flashcardsCount ? (
                      <span className="text-[10px] text-slate-500">
                        · {subj.flashcardsCount} flashcards
                      </span>
                    ) : null}
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                    {subj.name}
                  </h4>

                  {/* Barra de progresso da disciplina */}
                  <div className="w-full max-w-xs h-1 bg-black/40 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        subj.isReviewedToday ? "bg-emerald-500" : "bg-indigo-500"
                      )}
                      style={{ width: `${subj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Botões de Ação Rápida de IA e Revisão */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                  
                  {/* Botão Gemini Notebook */}
                  {hasNotebook && (
                    <a
                      href={subj.notebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-colors"
                      title="Abrir Gemini Notebook da Disciplina"
                    >
                      <BookOpen size={14} />
                    </a>
                  )}

                  {/* Botão Flashcards IA */}
                  <button
                    onClick={() => setSelectedSubject({ subject: subj, collegeId: subj.collegeId })}
                    className={cn(
                      "flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all",
                      hasFlashcards
                        ? "bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25"
                        : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                    )}
                    title="Estudar Flashcards & Resumo de IA"
                  >
                    <Layers size={13} />
                    <span>Flashcards</span>
                  </button>

                  {/* Slides */}
                  {hasSlides && (
                    <a
                      href={subj.aiArtifacts?.slidesUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors"
                      title="Ver Slides Gerados por IA"
                    >
                      <Presentation size={14} />
                    </a>
                  )}

                  {/* Roteiro */}
                  {hasVideo && (
                    <a
                      href={subj.aiArtifacts?.videoScriptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors"
                      title="Ver Roteiro de Vídeo Didático"
                    >
                      <Video size={14} />
                    </a>
                  )}

                  {/* Infográfico */}
                  {hasInfographic && (
                    <a
                      href={subj.aiArtifacts?.infographicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 transition-colors"
                      title="Ver Infográfico Visual"
                    >
                      <ImageIcon size={14} />
                    </a>
                  )}

                  {/* Botão Alternar Revisão Hoje */}
                  <button
                    onClick={() => toggleSubjectReviewedToday(subj.collegeId, subj.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-300 shadow-sm",
                      subj.isReviewedToday
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                        : "bg-white/10 text-slate-300 border-white/15 hover:bg-indigo-600 hover:text-white hover:border-indigo-500"
                    )}
                    title={subj.isReviewedToday ? "Desmarcar revisão de hoje" : "Marcar como revisado hoje"}
                  >
                    {subj.isReviewedToday ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="hidden sm:inline">Revisado</span>
                      </>
                    ) : (
                      <>
                        <Flame size={13} className="text-amber-400" />
                        <span>Revisar</span>
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
          subject={selectedSubject.subject}
          collegeId={selectedSubject.collegeId}
          isReviewedToday={selectedSubject.subject.lastReviewedDate === todayStr}
          onMarkReviewed={() => {
            toggleSubjectReviewedToday(selectedSubject.collegeId, selectedSubject.subject.id);
            setSelectedSubject(null);
          }}
        />
      )}
    </div>
  );
}
