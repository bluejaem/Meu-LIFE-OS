import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { useStore } from '@/store/useStore';
import { useAcademicStore } from '@/store/useAcademicStore';
import { 
  GraduationCap, BookOpen, Plus, Settings2, Trash2, CheckCircle2, 
  Clock, Sparkles, ExternalLink, Award, Layers
} from 'lucide-react';
import { Modal, FormField, inputClass, selectClass, SubmitButton, ConfirmModal } from '../ui/Modal';
import { AcademicSubjectModal } from './AcademicSubjectModal';
import type { College, AcademicSubject } from '@/types';

interface CollegeFormData {
  name: string;
  course: string;
  period: string;
  degree: string;
  currentSemester: string;
}

const EMPTY_COLLEGE_FORM: CollegeFormData = {
  name: '',
  course: '',
  period: 'EAD',
  degree: 'Técnico',
  currentSemester: '1'
};

export function Faculdades() {
  const { 
    colleges = [], 
    addCollege, 
    updateCollege, 
    deleteCollege, 
    updateSubject: updateStoreSubject 
  } = useStore();

  const { 
    subjects: globalAcademicSubjects = [],
    addSubject: addGlobalSubject, 
    updateSubject: updateGlobalSubject, 
    deleteSubject: deleteGlobalSubject 
  } = useAcademicStore();

  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(colleges[0]?.id || '');

  // Modais de Faculdade
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [collegeForm, setCollegeForm] = useState<CollegeFormData>(EMPTY_COLLEGE_FORM);
  const [deleteCollegeId, setDeleteCollegeId] = useState<string | null>(null);

  // Modais de Disciplina
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<AcademicSubject | null>(null);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);

  // Filtro de status de disciplina
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'pending'>('all');

  const activeCollege = colleges.find((c) => c.id === selectedCollegeId) || colleges[0];

  // Combina disciplinas locais da faculdade e disciplinas globais pelo nome da instituição
  const collegeSubjects: AcademicSubject[] = (() => {
    if (!activeCollege) return [];
    const local = activeCollege.subjects || [];
    const matchingGlobals = globalAcademicSubjects.filter(
      (s) => s.institution?.trim().toLowerCase() === activeCollege.name?.trim().toLowerCase()
    );

    // Mescla garantindo que itens com mesmo ID não dupliquem
    const map = new Map<string, AcademicSubject>();
    local.forEach((s) => map.set(s.id, s));
    matchingGlobals.forEach((s) => {
      if (!map.has(s.id)) map.set(s.id, s);
    });

    return Array.from(map.values());
  })();

  const completedCount = collegeSubjects.filter(
    (s) => s.status === 'completed' || s.progress === 100
  ).length;

  const inProgressCount = collegeSubjects.filter(
    (s) => s.status === 'in_progress' || (s.progress && s.progress > 0 && s.progress < 100)
  ).length;

  const pendingCount = collegeSubjects.length - completedCount - inProgressCount;

  const progressPercent = collegeSubjects.length > 0
    ? Math.round((completedCount / collegeSubjects.length) * 100)
    : 0;

  const validGrades = collegeSubjects
    .map((s) => s.grade)
    .filter((g): g is number => typeof g === 'number' && !isNaN(g));
  
  const averageGrade = validGrades.length > 0
    ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(1)
    : null;

  const filteredSubjects = collegeSubjects.filter((s) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'completed') return s.status === 'completed' || s.progress === 100;
    if (statusFilter === 'in_progress') return s.status === 'in_progress' || (s.progress && s.progress > 0 && s.progress < 100);
    if (statusFilter === 'pending') return s.status === 'pending' || (!s.progress && s.status !== 'in_progress');
    return true;
  });

  // Ações de Faculdade
  const handleOpenCreateCollege = () => {
    setEditingCollege(null);
    setCollegeForm(EMPTY_COLLEGE_FORM);
    setIsCollegeModalOpen(true);
  };

  const handleOpenEditCollege = (college: College) => {
    setEditingCollege(college);
    setCollegeForm({
      name: college.name,
      course: college.course,
      period: college.period || 'EAD',
      degree: college.degree || 'Técnico',
      currentSemester: String(college.currentSemester || '1')
    });
    setIsCollegeModalOpen(true);
  };

  const handleSaveCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeForm.name.trim() || !collegeForm.course.trim()) return;

    if (editingCollege) {
      updateCollege(editingCollege.id, {
        name: collegeForm.name.trim(),
        course: collegeForm.course.trim(),
        period: collegeForm.period.trim(),
        degree: collegeForm.degree.trim(),
        currentSemester: collegeForm.currentSemester.trim()
      });
    } else {
      addCollege({
        name: collegeForm.name.trim(),
        course: collegeForm.course.trim(),
        period: collegeForm.period.trim(),
        degree: collegeForm.degree.trim(),
        currentSemester: collegeForm.currentSemester.trim(),
        subjects: []
      });
    }

    setIsCollegeModalOpen(false);
  };

  const handleConfirmDeleteCollege = () => {
    if (!deleteCollegeId) return;
    deleteCollege(deleteCollegeId);
    if (selectedCollegeId === deleteCollegeId) {
      const remaining = colleges.filter((c) => c.id !== deleteCollegeId);
      setSelectedCollegeId(remaining[0]?.id || '');
    }
    setDeleteCollegeId(null);
  };

  // Ações de Disciplina
  const handleSaveSubject = (savedSubject: AcademicSubject) => {
    if (!activeCollege) return;

    if (editingSubject) {
      // Atualiza local na faculdade
      updateStoreSubject(activeCollege.id, savedSubject.id, savedSubject);
      // Atualiza global no Hub
      updateGlobalSubject(savedSubject.id, savedSubject);
    } else {
      // Adiciona localmente na faculdade
      const currentLocal = activeCollege.subjects || [];
      updateCollege(activeCollege.id, {
        subjects: [...currentLocal, savedSubject]
      });
      // Adiciona no Hub global de IA
      addGlobalSubject({
        name: savedSubject.name,
        institution: activeCollege.name,
        semester: savedSubject.semester || `${activeCollege.currentSemester || 1}º Semestre`,
        activeReviewPending: savedSubject.activeReviewPending ?? true,
        progress: savedSubject.progress || 0,
        grade: savedSubject.grade,
        notes: savedSubject.notes,
        status: savedSubject.status || 'in_progress',
        code: savedSubject.code,
        credits: savedSubject.credits,
        artifacts: savedSubject.artifacts,
        flashcardsCount: savedSubject.flashcardsCount || 10
      });
    }

    setIsSubjectModalOpen(false);
    setEditingSubject(null);
  };

  const handleToggleSubjectStatus = (subject: AcademicSubject) => {
    if (!activeCollege) return;
    const nextStatus: 'completed' | 'in_progress' | 'pending' = subject.status === 'completed'
      ? 'pending'
      : subject.status === 'in_progress'
        ? 'completed'
        : 'in_progress';
    const nextProgress = nextStatus === 'completed' ? 100 : nextStatus === 'pending' ? 0 : 50;

    const updated: Partial<AcademicSubject> = {
      ...subject,
      status: nextStatus,
      progress: nextProgress
    };

    updateStoreSubject(activeCollege.id, subject.id, updated);
    updateGlobalSubject(subject.id, updated);
  };

  const handleConfirmDeleteSubject = () => {
    if (!deleteSubjectId || !activeCollege) return;
    const currentLocal = activeCollege.subjects || [];
    updateCollege(activeCollege.id, {
      subjects: currentLocal.filter((s) => s.id !== deleteSubjectId)
    });
    deleteGlobalSubject(deleteSubjectId);
    setDeleteSubjectId(null);
  };

  return (
    <PageLayout
      title="Hub de Faculdades & Cursos"
      subtitle="Gerenciamento de cursos superiores, matrizes curriculares e evolução acadêmica"
      actions={
        <button
          onClick={handleOpenCreateCollege}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Nova Faculdade / Curso
        </button>
      }
    >
      <div className="space-y-6 pb-12 max-w-7xl">
        {/* Seletor de Cursos / Faculdades */}
        {colleges.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <GraduationCap size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nenhuma faculdade ou curso cadastrado</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Cadastre seus cursos de graduação, pós-graduação ou certificações para acompanhar disciplinas e progresso.
              </p>
            </div>
            <button
              onClick={handleOpenCreateCollege}
              className="mt-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Plus size={14} /> Cadastrar Primeira Faculdade
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {colleges.map((college) => {
              const isSelected = college.id === activeCollege?.id;
              const count = (college.subjects || []).length;
              return (
                <div
                  key={college.id}
                  onClick={() => setSelectedCollegeId(college.id)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer relative group ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-100 text-sm leading-tight">{college.name}</h3>
                        <p className="text-xs text-slate-400">{college.degree || 'Técnico'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditCollege(college);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Editar curso"
                      >
                        <Settings2 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCollegeId(college.id);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                        title="Excluir curso"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-300 line-clamp-1 mb-2">
                    {college.course}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span>Semestre: {college.currentSemester || 1}º</span>
                    <span className="text-indigo-400 font-medium">
                      {count} {count === 1 ? 'matéria' : 'matérias'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Informações e Métricas do Curso Selecionado */}
        {activeCollege && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            {/* Header da Faculdade Selecionada */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {activeCollege.name}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {activeCollege.degree || 'Técnico'} · {activeCollege.period || 'EAD'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{activeCollege.course}</h2>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                {averageGrade && (
                  <div className="text-right">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Award size={12} className="text-amber-400" /> Média Geral
                    </span>
                    <p className="text-2xl font-bold text-amber-300">{averageGrade}</p>
                  </div>
                )}

                <div className="text-right">
                  <span className="text-xs text-slate-400">Progresso Geral</span>
                  <p className="text-2xl font-bold text-white">{progressPercent}%</p>
                </div>

                <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Barra de Filtros e Adicionar Matéria */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-black/25 p-1 rounded-xl border border-white/10 text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === 'all' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todas ({collegeSubjects.length})
                </button>
                <button
                  onClick={() => setStatusFilter('in_progress')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    statusFilter === 'in_progress' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock size={12} className="text-amber-400" /> Em Curso ({inProgressCount})
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    statusFilter === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 size={12} className="text-emerald-400" /> Concluídas ({completedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === 'pending' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pendentes ({pendingCount})
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingSubject(null);
                  setIsSubjectModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 bg-indigo-600/90 hover:bg-indigo-600 text-white px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors shadow-md"
              >
                <Plus size={14} /> Adicionar Disciplina
              </button>
            </div>

            {/* Lista de Disciplinas */}
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-3">
                <BookOpen className="w-8 h-8 text-slate-600" />
                <p className="text-sm text-slate-400">Nenhuma disciplina encontrada com o filtro selecionado.</p>
                <button
                  onClick={() => {
                    setEditingSubject(null);
                    setIsSubjectModalOpen(true);
                  }}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  + Cadastrar disciplina agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredSubjects.map((subject) => {
                  const isCompleted = subject.status === 'completed' || subject.progress === 100;
                  const isInProgress = subject.status === 'in_progress' || (subject.progress && subject.progress > 0 && subject.progress < 100);
                  const artifacts = subject.artifacts || subject.aiArtifacts;

                  return (
                    <div
                      key={subject.id}
                      className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between gap-3 group relative"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-slate-200 leading-snug">
                              {subject.name}
                            </h4>
                            <div className="flex items-center gap-2.5 text-xs text-slate-400">
                              {subject.code && (
                                <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[11px]">
                                  {subject.code}
                                </span>
                              )}
                              {subject.credits && <span>{subject.credits} créditos</span>}
                              {subject.semester && <span>{subject.semester}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleSubjectStatus(subject)}
                              className={`px-2 py-0.5 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                                isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                  : isInProgress
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                              }`}
                              title="Clique para alternar status"
                            >
                              {isCompleted ? 'Concluída' : isInProgress ? 'Em Curso' : 'Pendente'}
                            </button>

                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingSubject(subject);
                                  setIsSubjectModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-white rounded"
                                title="Editar"
                              >
                                <Settings2 size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteSubjectId(subject.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded"
                                title="Excluir"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {subject.notes && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {subject.notes}
                          </p>
                        )}
                      </div>

                      {/* Progresso, Nota e Links de IA */}
                      <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Progresso: {subject.progress || 0}%</span>
                          {subject.grade !== undefined && (
                            <span className="font-semibold text-slate-200">
                              Nota: {subject.grade}
                            </span>
                          )}
                        </div>

                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${subject.progress || 0}%` }}
                          />
                        </div>

                        {/* Atalhos para Artefatos de IA se existirem */}
                        {(subject.notebookUrl || artifacts?.notebookUrl || artifacts?.slidesUrl) && (
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            {(subject.notebookUrl || artifacts?.notebookUrl) && (
                              <a
                                href={subject.notebookUrl || artifacts?.notebookUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 transition-colors"
                              >
                                <Sparkles size={11} className="text-amber-400" />
                                <span>NotebookLM</span>
                                <ExternalLink size={10} />
                              </a>
                            )}

                            {artifacts?.slidesUrl && (
                              <a
                                href={artifacts.slidesUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 transition-colors"
                              >
                                <Layers size={11} />
                                <span>Slides</span>
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Criar / Editar Faculdade */}
      <Modal
        open={isCollegeModalOpen}
        onClose={() => setIsCollegeModalOpen(false)}
        title={editingCollege ? 'Editar Faculdade / Curso' : 'Adicionar Nova Faculdade'}
      >
        <form onSubmit={handleSaveCollege} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nome da Instituição" required>
              <input
                type="text"
                className={inputClass}
                placeholder="Ex: UNINTER, UFS, USP..."
                value={collegeForm.name}
                onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                required
                autoFocus
              />
            </FormField>

            <FormField label="Nome do Curso" required>
              <input
                type="text"
                className={inputClass}
                placeholder="Ex: Análise e Desenv. de Sistemas"
                value={collegeForm.course}
                onChange={(e) => setCollegeForm({ ...collegeForm, course: e.target.value })}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormField label="Grau / Nível">
              <select
                className={selectClass}
                value={collegeForm.degree}
                onChange={(e) => setCollegeForm({ ...collegeForm, degree: e.target.value })}
              >
                <option value="Técnico">Técnico</option>
                <option value="Tecnólogo">Tecnólogo</option>
                <option value="Bacharelado">Bacharelado</option>
                <option value="Licenciatura">Licenciatura</option>
                <option value="Mestrado">Mestrado</option>
                <option value="Doutorado">Doutorado</option>
                <option value="Pós-Graduação">Pós-Graduação</option>
                <option value="Certificação">Certificação</option>
              </select>
            </FormField>

            <FormField label="Semestre Atual">
              <input
                type="text"
                className={inputClass}
                placeholder="Ex: 1º, 3º, 2026.1"
                value={collegeForm.currentSemester}
                onChange={(e) => setCollegeForm({ ...collegeForm, currentSemester: e.target.value })}
              />
            </FormField>

            <FormField label="Modalidade / Período">
              <input
                type="text"
                className={inputClass}
                placeholder="Ex: EAD, Noturno, Integral"
                value={collegeForm.period}
                onChange={(e) => setCollegeForm({ ...collegeForm, period: e.target.value })}
              />
            </FormField>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCollegeModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <SubmitButton>{editingCollege ? 'Salvar Alterações' : 'Cadastrar Curso'}</SubmitButton>
          </div>
        </form>
      </Modal>

      {/* Modal Adicionar / Editar Disciplina */}
      {isSubjectModalOpen && (
        <AcademicSubjectModal
          open={isSubjectModalOpen}
          onClose={() => {
            setIsSubjectModalOpen(false);
            setEditingSubject(null);
          }}
          initialData={editingSubject}
          defaultInstitution={activeCollege?.name || ''}
          onSave={handleSaveSubject}
        />
      )}

      {/* Confirmação de Exclusão de Faculdade */}
      <ConfirmModal
        open={!!deleteCollegeId}
        onClose={() => setDeleteCollegeId(null)}
        onConfirm={handleConfirmDeleteCollege}
        title="Excluir Faculdade / Curso"
        description="Esta instituição e todas as disciplinas vinculadas a ela serão excluídas."
        confirmLabel="Excluir"
        danger
      />

      {/* Confirmação de Exclusão de Disciplina */}
      <ConfirmModal
        open={!!deleteSubjectId}
        onClose={() => setDeleteSubjectId(null)}
        onConfirm={handleConfirmDeleteSubject}
        title="Excluir Disciplina"
        description="Esta matéria será removida do curso selecionado e do Hub Acadêmico."
        confirmLabel="Excluir"
        danger
      />
    </PageLayout>
  );
}