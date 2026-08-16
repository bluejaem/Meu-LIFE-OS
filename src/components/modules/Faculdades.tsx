import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { Plus, GraduationCap, Pencil, Trash2 } from 'lucide-react';

import { useStore } from '@/store/useStore';
import type { College, Subject } from '@/types';
import { Modal, ConfirmModal, FormField, inputClass, SubmitButton } from '../ui/Modal';
import { ContextMenu } from '../ui/ContextMenu';

const EMPTY_FORM = { name: '', course: '', period: '', subjects: [] as Subject[] };

export function Faculdades() {
  const { colleges, addCollege, updateCollege, deleteCollege } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCollege, setEditCollege] = useState<College | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

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

  return (
    <PageLayout
      title="Faculdades"
      subtitle="Gestão acadêmica e disciplinas"
      actions={
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Adicionar Curso
        </button>
      }
    >
      <div className="flex flex-col gap-6 pb-8">
        {colleges.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center py-20 text-center gap-4">
            <GraduationCap size={40} className="text-slate-600" />
            <p className="text-slate-400">Nenhum curso registrado ainda.</p>
          </div>
        ) : (
          colleges.map(college => {
            const avgProgress = college.subjects.length > 0
              ? Math.round(college.subjects.reduce((acc, s) => acc + s.progress, 0) / college.subjects.length)
              : 0;
            return (
              <div key={college.id} className="glass-panel p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                      <GraduationCap size={18} className="text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{college.name}</h3>
                      <p className="text-sm text-slate-400">{college.course} · {college.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">{avgProgress}%</span>
                    <ContextMenu
                      items={[
                        { label: 'Editar', icon: <Pencil size={14} />, onClick: () => openEdit(college) },
                        { label: 'Excluir', icon: <Trash2 size={14} />, onClick: () => setDeleteId(college.id), danger: true },
                      ]}
                    />
                  </div>
                </div>

                {college.subjects.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {college.subjects.map(subj => (
                      <div key={subj.id}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-300 font-medium">{subj.name}</span>
                          <div className="flex items-center gap-3">
                            {subj.grade && <span className="text-slate-400">Nota: {subj.grade}</span>}
                            <span className="text-white font-semibold">{subj.progress}%</span>
                          </div>
                        </div>
                        <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${subj.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Adicionar Curso" size="lg">
        <CollegeForm form={form} setForm={setForm} onSubmit={handleCreate} label="Adicionar" />
      </Modal>
      <Modal open={!!editCollege} onClose={() => setEditCollege(null)} title="Editar Curso" size="lg">
        <CollegeForm form={form} setForm={setForm} onSubmit={handleEdit} label="Salvar" />
      </Modal>
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteCollege(deleteId)} title="Excluir Curso" confirmLabel="Excluir" danger />
    </PageLayout>
  );
}

function CollegeForm({ form, setForm, onSubmit, label }: any) {
  const addSubject = () => setForm({ ...form, subjects: [...form.subjects, { id: crypto.randomUUID(), name: '', progress: 0 }] });
  const updateSubject = (id: string, data: Partial<Subject>) => setForm({ ...form, subjects: form.subjects.map((s: Subject) => s.id === id ? { ...s, ...data } : s) });
  const removeSubject = (id: string) => setForm({ ...form, subjects: form.subjects.filter((s: Subject) => s.id !== id) });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Instituição">
          <input className={inputClass} placeholder="UFMG, UNA, etc." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus required />
        </FormField>
        <FormField label="Curso">
          <input className={inputClass} placeholder="Engenharia de Computação..." value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Período">
        <input className={inputClass} placeholder="5º Período / 2026.1" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} />
      </FormField>

      {/* Subjects */}
      <div className="flex flex-col gap-3 max-h-64 overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disciplinas</span>
          <button type="button" onClick={addSubject} className="text-xs text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-1">
            <Plus size={12} /> Adicionar
          </button>
        </div>
        {form.subjects.map((subj: Subject) => (
          <div key={subj.id} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
            <input
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
              placeholder="Nome da disciplina"
              value={subj.name}
              onChange={e => updateSubject(subj.id, { name: e.target.value })}
            />
            <input
              type="number" min={0} max={100}
              className="w-16 bg-transparent text-sm text-slate-200 text-center focus:outline-none"
              placeholder="0%"
              value={subj.progress}
              onChange={e => updateSubject(subj.id, { progress: Number(e.target.value) })}
            />
            <button type="button" onClick={() => removeSubject(subj.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <SubmitButton>{label}</SubmitButton>
    </form>
  );
}
