import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { 
  Plus, GraduationCap, Sparkles, BookOpen, Layers, 
  Presentation, Video, Image as ImageIcon, Flame, Check, 
  Settings2, Trash2, Search, RotateCcw
} from 'lucide-react';
import { useAcademicStore } from '@/store/useAcademicStore';
import { cn } from '@/lib/utils';
import type { AcademicSubject } from '@/types';
import { FlashcardsStudyModal } from './FlashcardsStudyModal';
import { AcademicSubjectModal } from './AcademicSubjectModal';
import { ConfirmModal } from '../ui/Modal';

export function AcademicHubView() {
  const { 
    subjects, 
    addSubject, 
    updateSubject, 
    deleteSubject, 
    toggleReviewStatus 
  } = useAcademicStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [selectedReviewFilter, setSelectedReviewFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Modais
  const [studySubject, setStudySubject] = useState<AcademicSubject | null>(null);
  const [editingSubject, setEditingSubject] = useState<AcademicSubject | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filtros
  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.notes && sub.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesInstitution = selectedInstitution === 'all' || sub.institution === selectedInstitution;
    const matchesReview = selectedReviewFilter === 'all' ||
      (selectedReviewFilter === 'pending' && sub.activeReviewPending) ||
      (selectedReviewFilter === 'completed' && !sub.activeReviewPending);

    return matchesSearch && matchesInstitution && matchesReview;
  });

  const uniqueInstitutions = Array.from(new Set(subjects.map(s => s.institution).filter(Boolean)));
  const pendingCount = subjects.filter(s => s.activeReviewPending).length;
  const withNotebookCount = subjects.filter(s => s.artifacts?.notebookUrl).length;

  return (
    <PageLayout
      title="Hub Acadêmico & Artefatos de IA"
      subtitle="Ecossistema de estudos integrados ao Google AI Pro e Gemini Notebooks"
      actions={
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Nova Disciplina Inteligente
        </button>
      }
    >
      <div className="flex flex-col gap-6 pb-10 max-w-7xl">
        
        {/* KPI Banner com Métricas de IA e Produtividade */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Disciplinas</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-white leading-none">{subjects.length}</span>
              <span className="text-xs text-slate-500">ativas</span>
            </div>
            <div className="flex gap-2 text-[10px] text-slate-400 mt-2">
              {uniqueInstitutions.map((inst, idx) => (
                <span key={inst} className="text-indigo-300 font-semibold">
                  {subjects.filter(s => s.institution === inst).length} {inst}
                  {idx < uniqueInstitutions.length - 1 && <span className="text-slate-500 mx-1">·</span>}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Flame size={12} /> Revisões Pendentes
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-amber-300 leading-none">{pendingCount}</span>
              <span className="text-xs text-slate-500">hoje</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-2">
              {pendingCount === 0 ? "Todas concluídas!" : "Combata a procrastinação"}
            </span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <BookOpen size={12} /> Gemini Notebooks
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-indigo-300 leading-none">{withNotebookCount}</span>
              <span className="text-xs text-slate-500">vinculados</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-2">
              Cadernos de IA conectados
            </span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Layers size={12} /> Flashcards de IA
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-purple-300 leading-none">
                {subjects.reduce((acc, s) => acc + (s.flashcardsCount || 0), 0)}
              </span>
              <span className="text-xs text-slate-500">cards ativos</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-2">
              Estudo com repetição espaçada
            </span>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Filtros por Instituição */}
          <div className="flex items-center gap-1 bg-black/25 p-1 rounded-xl border border-white/10 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedInstitution('all')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                selectedInstitution === 'all' ? "bg-white/15 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              )}
            >
              Todas ({subjects.length})
            </button>
            {uniqueInstitutions.map(inst => (
              <button
                key={inst}
                onClick={() => setSelectedInstitution(inst)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                  selectedInstitution === inst ? "bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                {inst} ({subjects.filter(s => s.institution === inst).length})
              </button>
            ))}
          </div>

          {/* Busca e Filtro de Revisão */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/25 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setSelectedReviewFilter('all')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                  selectedReviewFilter === 'all' ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                )}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedReviewFilter('pending')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                  selectedReviewFilter === 'pending' ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:text-white"
                )}
              >
                <Flame size={11} className="text-amber-400" /> Pendentes
              </button>
              <button
                onClick={() => setSelectedReviewFilter('completed')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                  selectedReviewFilter === 'completed' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
                )}
              >
                <Check size={11} className="text-emerald-400" /> Concluídas
              </button>
            </div>

            <div className="relative min-w-[200px]">
              <Search size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar disciplina..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Grid de Cards de Disciplinas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSubjects.length === 0 ? (
            <div className="col-span-full py-16 text-center glass-panel flex flex-col items-center justify-center gap-3">
              <GraduationCap size={44} className="text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Nenhuma disciplina encontrada</p>
              <p className="text-xs text-slate-500">Tente ajustar os filtros ou cadastre uma nova matéria.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 mt-2"
              >
                + Adicionar disciplina agora
              </button>
            </div>
          ) : (
            filteredSubjects.map(sub => {
              const isPending = sub.activeReviewPending;

              const artifacts = sub.artifacts;

              return (
                <div
                  key={sub.id}
                  className={cn(
                    "glass-panel p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 group relative overflow-hidden",
                    isPending
                      ? "border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.04]"
                      : "border-emerald-500/20 bg-emerald-500/[0.02] hover:border-emerald-500/35"
                  )}
                >
                  {/* Topo do Card: Badges e Ações de Gestão */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {sub.institution}
                        </span>

                        {sub.semester && (
                          <span className="text-[10px] text-slate-400 font-medium bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            {sub.semester}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingSubject(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Editar matéria e links de IA"
                        >
                          <Settings2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(sub.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                          title="Excluir disciplina"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Nome da Matéria */}
                    <h3 className="text-base font-bold text-white leading-snug group-hover:text-indigo-200 transition-colors mb-2">
                      {sub.name}
                    </h3>

                    {/* Notas da Matéria */}
                    {sub.notes && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
                        {sub.notes}
                      </p>
                    )}

                    {/* Status de Revisão Ativa */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
                        isPending
                          ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      )}>
                        {isPending ? (
                          <>
                            <Flame size={10} className="text-amber-400" />
                            Revisão Ativa Pendente
                          </>
                        ) : (
                          <>
                            <Check size={10} className="text-emerald-400" />
                            Revisão Concluída Hoje
                          </>
                        )}
                      </span>

                      {sub.grade !== undefined && (
                        <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                          Nota: {sub.grade}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barra de Acesso Rápido a Artefatos de IA do Gemini Notebook */}
                  <div className="pt-3 border-t border-white/5 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1 text-indigo-300">
                        <Sparkles size={12} className="text-amber-400" />
                        Artefatos Gemini IA
                      </span>
                      <span className="text-[10px] text-slate-500">Acesso a 1 clique</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      
                      {/* Notebook */}
                      {(sub.notebookUrl || artifacts?.notebookUrl) ? (
                        <a
                          href={sub.notebookUrl || artifacts?.notebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30 transition-colors"
                          title="Abrir Gemini Notebook da Disciplina"
                        >
                          <BookOpen size={13} />
                          <span>Notebook</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Sem Notebook</span>
                      )}

                      {/* Flashcards */}
                      <button
                        onClick={() => setStudySubject(sub)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30 transition-colors"
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
                    </div>

                    {/* Botão Concluir Revisão / Alternar */}
                    <button
                      onClick={() => toggleReviewStatus(sub.id)}
                      className={cn(
                        "w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md",
                        isPending
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:scale-[1.01]"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                      )}
                    >
                      {isPending ? (
                        <>
                          <Check size={14} />
                          <span>Concluir Revisão Ativa</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw size={13} className="text-emerald-400" />
                          <span>Reabrir para Revisão</span>
                        </>
                      )}
                    </button>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Modal de Flashcards Interativos */}
      {studySubject && (
        <FlashcardsStudyModal
          open={!!studySubject}
          onClose={() => setStudySubject(null)}
          subject={studySubject}
          isReviewedToday={!studySubject.activeReviewPending}
          onMarkReviewed={() => {
            if (studySubject.activeReviewPending) {
              toggleReviewStatus(studySubject.id);
            }
            setStudySubject(null);
          }}
        />
      )}

      {/* Modal de Adicionar/Editar Disciplina */}
      {(isCreateModalOpen || editingSubject) && (
        <AcademicSubjectModal
          open={isCreateModalOpen || !!editingSubject}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingSubject(null);
          }}
          initialData={editingSubject}
          onSave={(data) => {
            if (editingSubject) {
              updateSubject(editingSubject.id, {
                ...data,
                institution: data.institution || 'Desconhecida',
                artifacts: data.aiArtifacts || data.artifacts
              });
            } else {
              addSubject({
                name: data.name,
                institution: data.institution || 'Desconhecida',
                semester: data.semester || '2026.1',
                activeReviewPending: true,
                progress: data.progress || 0,
                grade: data.grade,
                notes: data.notes,
                artifacts: data.aiArtifacts || {
                  notebookUrl: data.notebookUrl,
                  slidesUrl: '',
                  videoScriptUrl: '',
                  flashcardsSummary: '',
                  infographicUrl: ''
                },
                flashcardsCount: data.flashcardsCount || 10
              });
            }
          }}
        />
      )}

      {/* Confirmação de Exclusão */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteSubject(deleteId);
            setDeleteId(null);
          }
        }}
        title="Excluir Disciplina"
        description="Esta disciplina e todos os links de artefatos de IA vinculados serão removidos permanentemente."
        confirmLabel="Excluir"
        danger
      />
    </PageLayout>
  );
}
