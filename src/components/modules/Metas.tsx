import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { Plus, Target, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { Goal, GoalType } from '@/types';
import { Modal, ConfirmModal, FormField, inputClass, selectClass, SubmitButton } from '../ui/Modal';
import { ContextMenu } from '../ui/ContextMenu';

const TYPE_CONFIG: Record<GoalType, { label: string; color: string; bg: string }> = {
  short: { label: 'Curto Prazo', color: 'text-sky-400', bg: 'bg-sky-400/10' },
  medium: { label: 'Médio Prazo', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  long: { label: 'Longo Prazo', color: 'text-purple-400', bg: 'bg-purple-400/10' },
};

const PROGRESS_COLORS = ['bg-sky-500', 'bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500'];

const EMPTY_FORM = { title: '', description: '', type: 'short' as GoalType, progress: 0, target: '', deadline: '' };

export function Metas() {
  const { goals, addGoal, updateGoal, deleteGoal } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [updateGoalId, setUpdateGoalId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [progressValue, setProgressValue] = useState(0);

  const openCreate = () => { setForm(EMPTY_FORM); setCreateOpen(true); };
  const openEdit = (g: Goal) => { setEditGoal(g); setForm({ title: g.title, description: g.description || '', type: g.type, progress: g.progress, target: g.target, deadline: g.deadline || '' }); };
  const openUpdate = (g: Goal) => { setUpdateGoalId(g.id); setProgressValue(g.progress); };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addGoal(form);
    setCreateOpen(false);
  };
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGoal || !form.title.trim()) return;
    updateGoal(editGoal.id, form);
    setEditGoal(null);
  };

  const goalsBy = (type: GoalType) => goals.filter(g => g.type === type);

  return (
    <PageLayout
      title="Metas"
      subtitle="Objetivos de curto, médio e longo prazo"
      actions={
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Nova Meta
        </button>
      }
    >
      <div className="flex flex-col gap-8 pb-8">
        {(['short', 'medium', 'long'] as GoalType[]).map(type => {
          const cfg = TYPE_CONFIG[type];
          const typeGoals = goalsBy(type);
          return (
            <div key={type}>
              <div className="flex items-center gap-3 mb-4">
                <span className={cn("text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full", cfg.bg, cfg.color)}>{cfg.label}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              {typeGoals.length === 0 ? (
                <button onClick={openCreate} className="w-full glass-panel py-6 text-center text-slate-500 text-sm hover:bg-white/5 transition-colors border-dashed border-white/10">
                  + Adicionar meta de {cfg.label.toLowerCase()}
                </button>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeGoals.map((goal, idx) => (
                    <div key={goal.id} className="glass-panel p-5 flex flex-col group hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", cfg.bg)}>
                          <Target size={16} className={cfg.color} />
                        </div>
                        <ContextMenu
                          items={[
                            { label: 'Editar', icon: <Pencil size={14} />, onClick: () => openEdit(goal) },
                            { label: 'Atualizar Progresso', icon: <TrendingUp size={14} />, onClick: () => openUpdate(goal) },
                            { label: 'Excluir', icon: <Trash2 size={14} />, onClick: () => setDeleteId(goal.id), danger: true },
                          ]}
                        />
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mb-1 leading-snug">{goal.title}</h3>
                      {goal.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{goal.description}</p>}
                      {goal.target && <p className="text-xs text-slate-400 mb-4 font-medium">Alvo: {goal.target}</p>}
                      {goal.deadline && <p className="text-xs text-slate-500 mb-4">Prazo: {new Date(goal.deadline + 'T12:00:00').toLocaleDateString('pt-BR')}</p>}

                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-xs font-medium mb-2">
                          <span className="text-slate-400">Progresso</span>
                          <span className={cn("font-bold", goal.progress === 100 ? "text-emerald-400" : "text-white")}>{goal.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", PROGRESS_COLORS[idx % PROGRESS_COLORS.length])}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Meta">
        <GoalForm form={form} setForm={setForm} onSubmit={handleCreate} label="Criar Meta" />
      </Modal>

      {/* Edit */}
      <Modal open={!!editGoal} onClose={() => setEditGoal(null)} title="Editar Meta">
        <GoalForm form={form} setForm={setForm} onSubmit={handleEdit} label="Salvar" />
      </Modal>

      {/* Update Progress */}
      <Modal open={!!updateGoalId} onClose={() => setUpdateGoalId(null)} title="Atualizar Progresso" size="sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm font-bold text-slate-200">
            <span>Progresso atual</span>
            <span className="text-indigo-400">{progressValue}%</span>
          </div>
          <input
            type="range" min={0} max={100} step={1}
            value={progressValue}
            onChange={e => setProgressValue(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setUpdateGoalId(null)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors">Cancelar</button>
            <button
              onClick={() => { if (updateGoalId) updateGoal(updateGoalId, { progress: progressValue }); setUpdateGoalId(null); }}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20"
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete */}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteGoal(deleteId)} title="Excluir Meta" confirmLabel="Excluir" danger />
    </PageLayout>
  );
}

function GoalForm({ form, setForm, onSubmit, label }: any) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label="Título da Meta">
        <input className={inputClass} placeholder="Ex: Concluir Engenharia da Computação" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus required />
      </FormField>
      <FormField label="Descrição (opcional)">
        <textarea className={cn(inputClass, "resize-none h-16")} placeholder="Contexto ou estratégia..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Prazo">
          <select className={selectClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as GoalType })}>
            <option value="short">Curto Prazo</option>
            <option value="medium">Médio Prazo</option>
            <option value="long">Longo Prazo</option>
          </select>
        </FormField>
        <FormField label="Alvo">
          <input className={inputClass} placeholder="Ex: 5 livros, 100 horas" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Data limite (opcional)">
        <input type="date" className={inputClass} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
      </FormField>
      <SubmitButton>{label}</SubmitButton>
    </form>
  );
}
