import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { Plus, FolderKanban, CheckCircle2, Pencil, Trash2, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { Project, ProjectStatus } from '@/types';
import { Modal, ConfirmModal, FormField, inputClass, selectClass, SubmitButton } from '../ui/Modal';
import { ContextMenu } from '../ui/ContextMenu';

const STATUS_COLORS: Record<ProjectStatus, { text: string; bg: string }> = {
  'Planejamento': { text: 'text-sky-400', bg: 'bg-sky-400/10' },
  'Em progresso': { text: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  'Pausado': { text: 'text-amber-400', bg: 'bg-amber-400/10' },
  'Concluído': { text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
};

const PROJECT_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500'];

const EMPTY_FORM = { title: '', description: '', status: 'Planejamento' as ProjectStatus, color: 'bg-indigo-500' };

export function Projetos() {
  const { projects, addProject, updateProject, deleteProject, tasks, getProjectProgress } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openCreate = () => { setForm(EMPTY_FORM); setCreateOpen(true); };
  const openEdit = (p: Project) => { setEditProject(p); setForm({ title: p.title, description: p.description || '', status: p.status, color: p.color }); };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addProject(form);
    setCreateOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject || !form.title.trim()) return;
    updateProject(editProject.id, form);
    setEditProject(null);
  };

  return (
    <PageLayout
      title="Projetos"
      subtitle="Suas iniciativas de longo prazo"
      actions={
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Novo Projeto
        </button>
      }
    >
      {projects.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center py-20 text-center gap-4">
          <FolderKanban size={40} className="text-slate-600" />
          <p className="text-slate-400 font-medium">Nenhum projeto criado ainda.</p>
          <button onClick={openCreate} className="text-indigo-400 text-sm font-semibold hover:text-indigo-300">+ Criar primeiro projeto</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {projects.map(p => {
            const progress = getProjectProgress(p.id);
            const projectTasks = tasks.filter(t => t.projectId === p.id);
            const doneTasks = projectTasks.filter(t => t.done);
            const colors = STATUS_COLORS[p.status];

            return (
              <div key={p.id} className="glass-panel p-5 flex flex-col group hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white")}>
                    <FolderKanban size={18} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full", colors.bg, colors.text)}>
                      {p.status}
                    </span>
                    <ContextMenu
                      items={[
                        { label: 'Editar', icon: <Pencil size={14} />, onClick: () => openEdit(p) },
                        { label: 'Arquivar', icon: <Archive size={14} />, onClick: () => updateProject(p.id, { status: 'Pausado' }) },
                        { label: 'Excluir', icon: <Trash2 size={14} />, onClick: () => setDeleteId(p.id), danger: true },
                      ]}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-100 mb-1 leading-snug">{p.title}</h3>
                {p.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{p.description}</p>}

                <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
                  <CheckCircle2 size={14} className="text-indigo-400" />
                  <span>{doneTasks.length} / {projectTasks.length} tarefas</span>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs font-medium mb-2">
                    <span className="text-slate-400">Progresso</span>
                    <span className="text-white">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div className={cn("h-full rounded-full transition-all duration-700", p.color)} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Projeto" description="Adicione um novo projeto">
        <ProjectForm form={form} setForm={setForm} onSubmit={handleCreate} label="Criar Projeto" />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editProject} onClose={() => setEditProject(null)} title="Editar Projeto">
        <ProjectForm form={form} setForm={setForm} onSubmit={handleEdit} label="Salvar" />
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteProject(deleteId)}
        title="Excluir Projeto"
        description="Esta ação é irreversível."
        confirmLabel="Excluir"
        danger
      />
    </PageLayout>
  );
}

function ProjectForm({ form, setForm, onSubmit, label }: any) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label="Nome do Projeto">
        <input className={inputClass} placeholder="Nome do projeto" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus required />
      </FormField>
      <FormField label="Descrição (opcional)">
        <textarea className={cn(inputClass, "resize-none h-20")} placeholder="Descreva o projeto..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Status">
          <select className={selectClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProjectStatus })}>
            {(['Planejamento', 'Em progresso', 'Pausado', 'Concluído'] as ProjectStatus[]).map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Cor">
          <div className="flex items-center gap-2 h-10">
            {PROJECT_COLORS.map(c => (
              <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                className={cn("w-6 h-6 rounded-full transition-all border-2", c, form.color === c ? "border-white scale-125" : "border-transparent")}
              />
            ))}
          </div>
        </FormField>
      </div>
      <SubmitButton>{label}</SubmitButton>
    </form>
  );
}
