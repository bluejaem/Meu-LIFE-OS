import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { 
  Plus, GraduationCap, Pencil, Trash2, Sparkles, Layers, Settings2, Check
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { College, AcademicSubject } from '@/types';
import { Modal, ConfirmModal, FormField, inputClass, SubmitButton } from '../ui/Modal';
import { ContextMenu } from '../ui/ContextMenu';
import { cn } from '@/lib/utils';
import { SubjectDetailsModal } from './SubjectDetailsModal';
import { AcademicSubjectModal } from './AcademicSubjectModal';

const EMPTY_FORM = { 
  name: '', 
  course: '', 
  period: '', 
  subjects: [] as AcademicSubject[] 
};

export function Faculdades() {
  const { colleges, addCollege, updateCollege, deleteCollege, toggleSubjectReviewedToday, updateSubject } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCollege, setEditCollege] = useState<College | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  // Modais
  const [studySubject, setStudySubject] = useState<{ subject: AcademicSubject; collegeId: string } | null>(null);
  const [editingSubject, setEditingSubject] = useState<{ subject: AcademicSubject | null; collegeId: string } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const openCreate = () => { setForm(EMPTY_FORM); setCreateOpen(true); };
  const openEdit = (c: College) => { setEditCollege(c); setForm({ ...c }); };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addCollege(form);
    setCreateOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCollege) return;
    updateCollege(editCollege.id, form);
    setEditCollege(null);
  };

  const handleSaveSubject = (savedSubject: AcademicSubject) => {
    if (!editingSubject) return;
    const { collegeId, subject } = editingSubject;
    const targetCollege = colleges.find(c => c.id === collegeId);
    if (!targetCollege) return;

    if (subject) {
      // Atualizar matéria existente
      updateSubject(collegeId, savedSubject.id, savedSubject);
    } else {
      // Adicionar nova matéria ao curso
      const newSubjects = [...targetCollege.subjects, savedSubject];
      updateCollege(collegeId, { subjects: newSubjects });
    }
  };

  return (
    <PageLayout
      title="Hub Acadêmico & Gestão de IA"
      subtitle="Integre o seu ecossistema de estudos com artefatos do Gemini Notebook"
      actions={
        <button 
          onClick={openCreate} 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Adicionar Instituição / Curso
        </button>
      }
    >
      <div className="flex flex-col gap-6 pb-8">
        {colleges.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center py-20 text-center gap-4">
            <GraduationCap size={40} className="text-slate-600" />
            <p className="text-slate-400">Nenhuma instituição ou curso registrado ainda.</p>
            <button
              onClick={openCreate}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Começar adicionando seu primeiro curso
            </button>
          </div>
        ) : (
          colleges.map(college => {
            const avgProgress = college.subjects.length > 0
              ? Math.round(college.subjects.reduce((acc, s) => acc + (s.progress || 0), 0) / college.subjects.length)
              : 0;


            return (
              <div key={college.id} className="glass-panel p-6 group rounded-2xl border border-white/10 relative overflow-hidden">
                {/* Header do Curso */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3.5">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                    )}>
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {college.name}
                        </span>
                        <span className="text-xs text-slate-400">{college.period}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-100">{college.course}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-bold text-white block">{avgProgress}%</span>
                      <span className="text-[10px] text-slate-500">Progresso Geral</span>
                    </div>
                    <ContextMenu
                      items={[
                        { label: 'Editar Curso', icon: <Pencil size={14} />, onClick: () => openEdit(college) },
                        { label: 'Excluir Curso', icon: <Trash2 size={14} />, onClick: () => setDeleteId(college.id), danger: true },
                      ]}
                    />
                  </div>
                </div>

                {/* Disciplinas e Artefatos de IA */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" />
                      Disciplinas & Ecossistema de IA ({college.subjects.length})
                    </span>
                    <button
                      onClick={() => setEditingSubject({ subject: null, collegeId: college.id })}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus size={12} /> Adicionar Disciplina
                    </button>
                  </div>

                  {college.subjects.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 italic">
                      Nenhuma disciplina cadastrada neste curso. Clique em "Adicionar Disciplina" acima.
                    </div>
                  ) : (
                    college.subjects.map(subj => {
                      const isReviewedToday = subj.lastReviewedDate === todayStr;

                      return (
                        <div
                          key={subj.id}
                          className={cn(
                            "p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5",
                            isReviewedToday 
                              ? "bg-emerald-500/[0.04] border-emerald-500/20" 
                              : "bg-white/[0.02] border-white/5 hover:border-white/15"
                          )}
                        >
                          {/* Info da Disciplina */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-200">{subj.name}</span>
                                {subj.grade !== undefined && (
                                  <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded">
                                    Nota: {subj.grade}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 font-semibold">{subj.progress}%</span>
                            </div>

                            {/* Barra de Progresso */}
                            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-2">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-700",
                                  isReviewedToday ? "bg-emerald-500" : "bg-indigo-500"
                                )}
                                style={{ width: `${subj.progress}%` }}
                              />
                            </div>

                            {subj.notes && (
                              <p className="text-[11px] text-slate-400 italic line-clamp-1">
                                {subj.notes}
                              </p>
                            )}
                          </div>

                          {/* Barra de Ações */}
                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            
                            {/* Detalhes Modal */}
                            <button
                              onClick={() => setStudySubject({ subject: subj, collegeId: college.id })}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25"
                              title="Ver Detalhes e Anotações"
                            >
                              <Layers size={13} />
                              <span>Detalhes / Anotações</span>
                            </button>

                            {/* Botão Gerenciar Artefatos */}
                            <button
                              onClick={() => setEditingSubject({ subject: subj, collegeId: college.id })}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
                              title="Editar Matéria"
                            >
                              <Settings2 size={14} />
                            </button>

                            {/* Toggle Revisado Hoje */}
                            <button
                              onClick={() => toggleSubjectReviewedToday(college.id, subj.id)}
                              className={cn(
                                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-300",
                                isReviewedToday
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-indigo-600 hover:text-white"
                              )}
                              title={isReviewedToday ? "Desmarcar revisão" : "Marcar como revisado hoje"}
                            >
                              {isReviewedToday ? (
                                <>
                                  <Check size={12} className="text-emerald-400" />
                                  <span>Revisado</span>
                                </>
                              ) : (
                                <span>Revisar Hoje</span>
                              )}
                            </button>

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Criar Curso */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Adicionar Instituição / Curso" size="lg">
        <CollegeForm form={form} setForm={setForm} onSubmit={handleCreate} label="Adicionar Curso" />
      </Modal>

      {/* Modal Editar Curso */}
      <Modal open={!!editCollege} onClose={() => setEditCollege(null)} title="Editar Instituição / Curso" size="lg">
        <CollegeForm form={form} setForm={setForm} onSubmit={handleEdit} label="Salvar Alterações" />
      </Modal>

      {/* Modal de Excluir */}
      <ConfirmModal 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteId && deleteCollege(deleteId)} 
        title="Excluir Instituição / Curso" 
        confirmLabel="Excluir" 
        danger 
      />

      {/* Modal de Estudo Ativo */}
      {studySubject && (
        <SubjectDetailsModal
          open={!!studySubject}
          onClose={() => setStudySubject(null)}
          subject={studySubject.subject}
          collegeId={studySubject.collegeId}
          isReviewedToday={studySubject.subject.lastReviewedDate === todayStr}
          onMarkReviewed={() => {
            toggleSubjectReviewedToday(studySubject.collegeId, studySubject.subject.id);
            setStudySubject(null);
          }}
        />
      )}

      {/* Modal de Edição de Disciplina & Artefatos de IA */}
      {editingSubject && (
        <AcademicSubjectModal
          open={!!editingSubject}
          onClose={() => setEditingSubject(null)}
          onSave={handleSaveSubject}
          initialData={editingSubject.subject}
          defaultInstitution={colleges.find(c => c.id === editingSubject.collegeId)?.name}
        />
      )}
    </PageLayout>
  );
}

function CollegeForm({ form, setForm, onSubmit, label }: any) {
  const addSubject = () => setForm({ 
    ...form, 
    subjects: [
      ...form.subjects, 
      { 
        id: crypto.randomUUID(), 
        name: '', 
        progress: 0, 
        institution: form.name || '',
        notes: '',
        flashcardsCount: 0
      }
    ] 
  });
  
  const updateSubj = (id: string, data: Partial<AcademicSubject>) => setForm({ 
    ...form, 
    subjects: form.subjects.map((s: AcademicSubject) => s.id === id ? { ...s, ...data } : s) 
  });

  const removeSubject = (id: string) => setForm({ 
    ...form, 
    subjects: form.subjects.filter((s: AcademicSubject) => s.id !== id) 
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Instituição">
          <input 
            className={inputClass} 
            placeholder="Ex: USP, Estácio, etc." 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })} 
            autoFocus 
            required 
          />
        </FormField>
        <FormField label="Nome do Curso">
          <input 
            className={inputClass} 
            placeholder="Análise e Desenv. de Sistemas..." 
            value={form.course} 
            onChange={e => setForm({ ...form, course: e.target.value })} 
            required
          />
        </FormField>
      </div>

      <FormField label="Período / Fase">
        <input 
          className={inputClass} 
          placeholder="Ex: Fase 1 / 2026.1" 
          value={form.period} 
          onChange={e => setForm({ ...form, period: e.target.value })} 
        />
      </FormField>

      {/* Lista de Disciplinas no Cadastro Rápido */}
      <div className="flex flex-col gap-3 max-h-64 overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disciplinas Iniciais</span>
          <button type="button" onClick={addSubject} className="text-xs text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-1">
            <Plus size={12} /> Adicionar Disciplina
          </button>
        </div>
        {form.subjects.map((subj: AcademicSubject) => (
          <div key={subj.id} className="flex items-center gap-2 bg-white/5 rounded-xl p-2.5 border border-white/5">
            <input
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
              placeholder="Nome da disciplina"
              value={subj.name}
              onChange={e => updateSubj(subj.id, { name: e.target.value })}
            />
            <input
              type="number" 
              min={0} 
              max={100}
              className="w-16 bg-transparent text-sm text-slate-200 text-center focus:outline-none"
              placeholder="0%"
              value={subj.progress}
              onChange={e => updateSubj(subj.id, { progress: Number(e.target.value) })}
            />
            <button 
              type="button" 
              onClick={() => removeSubject(subj.id)} 
              className="text-slate-600 hover:text-rose-400 transition-colors p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <SubmitButton>{label}</SubmitButton>
    </form>
  );
}
