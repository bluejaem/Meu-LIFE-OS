import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { Plus, Tag, Calendar, Check, Pencil, Trash2, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { Task, TaskTag, Priority } from '@/types';
import { Modal, ConfirmModal, FormField, inputClass, selectClass, SubmitButton } from '../ui/Modal';
import { ContextMenu } from '../ui/ContextMenu';

const TAG_COLORS: Record<TaskTag, { bg: string; text: string }> = {
  Projeto: { bg: 'bg-indigo-500/15', text: 'text-indigo-400' },
  Faculdade: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  Pessoal: { bg: 'bg-sky-500/15', text: 'text-sky-400' },
  Leitura: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  Trabalho: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  Saúde: { bg: 'bg-rose-500/15', text: 'text-rose-400' },
  Outro: { bg: 'bg-slate-500/15', text: 'text-slate-400' },
};

const PRIORITY_DOT: Record<Priority, string> = {
  low: 'bg-slate-500',
  medium: 'bg-amber-400',
  high: 'bg-rose-500',
};


const EMPTY_TASK: Omit<Task, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  tag: 'Pessoal' as TaskTag,
  priority: 'medium' as Priority,
  date: new Date().toISOString().split('T')[0],
  done: false,
  subtasks: [],
};

export function Tarefas() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, duplicateTask } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_TASK);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === todayStr && !t.done);
  const upcomingTasks = tasks.filter(t => t.date > todayStr && !t.done);
  const doneTasks = tasks.filter(t => t.done);

  const openCreate = () => { setForm(EMPTY_TASK); setCreateOpen(true); };
  const openEdit = (task: Task) => { setEditTask(task); setForm({ ...EMPTY_TASK, ...task, description: task.description ?? '' }); };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addTask(form);
    setCreateOpen(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask || !form.title.trim()) return;
    updateTask(editTask.id, form);
    setEditTask(null);
  };

  return (
    <PageLayout
      title="Tarefas"
      subtitle="O que precisa ser feito?"
      actions={
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Nova Tarefa
        </button>
      }
    >
      <div className="flex flex-col gap-8 max-w-4xl pb-8">
        <TaskSection title="Hoje" tasks={todayTasks} onToggle={toggleTask} onEdit={openEdit} onDelete={setDeleteId} onDuplicate={duplicateTask} expandedId={expandedId} setExpandedId={setExpandedId} />
        {upcomingTasks.length > 0 && <TaskSection title="Próximos" tasks={upcomingTasks} onToggle={toggleTask} onEdit={openEdit} onDelete={setDeleteId} onDuplicate={duplicateTask} expandedId={expandedId} setExpandedId={setExpandedId} />}
        {doneTasks.length > 0 && <TaskSection title="Concluídas" tasks={doneTasks} onToggle={toggleTask} onEdit={openEdit} onDelete={setDeleteId} onDuplicate={duplicateTask} expandedId={expandedId} setExpandedId={setExpandedId} muted />}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Tarefa" description="Adicione uma nova tarefa ao seu sistema">
        <TaskForm form={form} setForm={setForm} onSubmit={handleSubmitCreate} label="Criar Tarefa" />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Editar Tarefa" description="Modifique os detalhes da tarefa">
        <TaskForm form={form} setForm={setForm} onSubmit={handleSubmitEdit} label="Salvar Alterações" />
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteTask(deleteId)}
        title="Excluir Tarefa"
        description="Esta ação é irreversível. Deseja continuar?"
        confirmLabel="Excluir"
        danger
      />
    </PageLayout>
  );
}

function TaskSection({ title, tasks, onToggle, onEdit, onDelete, onDuplicate, expandedId, setExpandedId, muted = false }: any) {
  if (tasks.length === 0) return (
    <div className="flex flex-col gap-2">
      <h3 className={cn("text-xs font-bold tracking-wider uppercase pl-1", muted ? "text-slate-600" : "text-slate-400")}>{title}</h3>
      <div className="glass-panel py-8 text-center text-slate-500 text-sm">Nenhuma tarefa aqui.</div>
    </div>
  );
  return (
    <div className="flex flex-col gap-2">
      <h3 className={cn("text-xs font-bold tracking-wider uppercase pl-1 flex items-center gap-2", muted ? "text-slate-600" : "text-slate-400")}>
        {title} <span className="font-normal text-slate-600">{tasks.length}</span>
      </h3>
      <div className="glass-panel overflow-hidden divide-y divide-white/5">
        {tasks.map((task: Task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            expanded={expandedId === task.id}
            onExpand={() => setExpandedId(expandedId === task.id ? null : task.id)}
            muted={muted}
          />
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onEdit, onDelete, onDuplicate, expanded, onExpand, muted }: any) {
  const colors = TAG_COLORS[task.tag as TaskTag] || TAG_COLORS.Outro;
  const { toggleSubtask } = useStore();

  return (
    <div className="group">
      <div className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Priority dot */}
          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", PRIORITY_DOT[task.priority as Priority])} />

          {/* Checkbox */}
          <button
            onClick={() => onToggle(task.id)}
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
              task.done ? "border-indigo-500 bg-indigo-500" : "border-slate-600 hover:border-slate-300"
            )}
          >
            {task.done && <Check size={12} className="text-white" strokeWidth={3} />}
          </button>

          {/* Title */}
          <span
            onClick={onExpand}
            className={cn(
              "text-sm font-medium truncate cursor-pointer transition-colors",
              task.done ? "line-through text-slate-500" : muted ? "text-slate-400" : "text-slate-200 hover:text-white"
            )}
          >
            {task.title}
          </span>

          {task.subtasks.length > 0 && (
            <button onClick={onExpand} className="ml-1 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={cn("hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-md", colors.bg, colors.text)}>
            <Tag size={10} /> {task.tag}
          </span>
          <span className="hidden md:flex items-center gap-1 text-xs text-slate-500">
            <Calendar size={11} />
            {task.date === new Date().toISOString().split('T')[0] ? 'Hoje' : task.date}
          </span>
          <ContextMenu
            items={[
              { label: 'Editar', icon: <Pencil size={14} />, onClick: () => onEdit(task) },
              { label: 'Duplicar', icon: <Copy size={14} />, onClick: () => onDuplicate(task.id) },
              { label: 'Marcar como concluída', icon: <Check size={14} />, onClick: () => onToggle(task.id) },
              { label: 'Excluir', icon: <Trash2 size={14} />, onClick: () => onDelete(task.id), danger: true },
            ]}
          />
        </div>
      </div>

      {/* Subtasks */}
      {expanded && task.subtasks.length > 0 && (
        <div className="px-12 pb-3 space-y-2 bg-black/20">
          {task.subtasks.map((st: any) => (
            <div key={st.id} className="flex items-center gap-2 text-sm">
              <button
                onClick={() => toggleSubtask(task.id, st.id)}
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-all",
                  st.done ? "border-indigo-500 bg-indigo-500" : "border-slate-600"
                )}
              >
                {st.done && <Check size={10} strokeWidth={3} className="text-white" />}
              </button>
              <span className={cn("text-xs", st.done ? "line-through text-slate-500" : "text-slate-300")}>{st.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskForm({ form, setForm, onSubmit, label }: any) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label="Título">
        <input
          className={inputClass}
          placeholder="O que precisa ser feito?"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          autoFocus
          required
        />
      </FormField>

      <FormField label="Descrição (opcional)">
        <textarea
          className={cn(inputClass, "resize-none h-20")}
          placeholder="Detalhes adicionais..."
          value={form.description || ''}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </FormField>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Tag">
          <select className={selectClass} value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value as TaskTag })}>
            {(['Projeto','Faculdade','Pessoal','Leitura','Trabalho','Saúde','Outro'] as TaskTag[]).map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Prioridade">
          <select className={selectClass} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })}>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </FormField>
        <FormField label="Data">
          <input type="date" className={inputClass} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </FormField>
      </div>

      <SubmitButton>{label}</SubmitButton>
    </form>
  );
}
