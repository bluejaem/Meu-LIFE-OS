import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { Plus, Clock, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { RoutineBlock, RoutineDay } from '@/types';
import { Modal, ConfirmModal, FormField, inputClass, selectClass, SubmitButton } from '../ui/Modal';
import { ContextMenu } from '../ui/ContextMenu';

const ALL_DAYS: RoutineDay[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const BLOCK_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

const EMPTY_FORM = { time: '07:00', title: '', duration: 60, category: 'Estudo', days: ['Seg','Ter','Qua','Qui','Sex'] as RoutineDay[], color: '#6366f1' };

export function Rotina() {
  const { routine, addRoutineBlock, updateRoutineBlock, deleteRoutineBlock } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editBlock, setEditBlock] = useState<RoutineBlock | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [activeDay, setActiveDay] = useState<RoutineDay>('Seg');

  const todayBlocks = routine.filter(r => r.days.includes(activeDay) || r.days.includes('Todos' as RoutineDay)).sort((a, b) => a.time.localeCompare(b.time));

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setCreateOpen(true); };
  const openEdit = (b: RoutineBlock) => { setEditBlock(b); setForm({ ...b }); };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addRoutineBlock(form);
    setCreateOpen(false);
  };
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBlock) return;
    updateRoutineBlock(editBlock.id, form);
    setEditBlock(null);
  };

  const toggleDay = (day: RoutineDay) => {
    const newDays = form.days.includes(day) ? form.days.filter((d: RoutineDay) => d !== day) : [...form.days, day];
    setForm({ ...form, days: newDays });
  };

  return (
    <PageLayout
      title="Rotina"
      subtitle="Organização do seu dia a dia"
      actions={
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Adicionar Atividade
        </button>
      }
    >
      <div className="flex flex-col gap-6 pb-8">
        {/* Day Selector */}
        <div className="flex items-center gap-2">
          {ALL_DAYS.map(d => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activeDay === d ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {todayBlocks.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center py-20 text-center gap-4">
            <Clock size={36} className="text-slate-600" />
            <p className="text-slate-400">Nenhuma atividade para {activeDay}.</p>
            <button onClick={openCreate} className="text-indigo-400 text-sm font-semibold hover:text-indigo-300">+ Adicionar atividade</button>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden divide-y divide-white/5">
            {todayBlocks.map(block => (
              <div key={block.id} className="group flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                {/* Time */}
                <div className="flex flex-col items-end w-14 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-200">{block.time}</span>
                  <span className="text-[11px] text-slate-500">{block.duration}min</span>
                </div>

                {/* Color stripe */}
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: block.color }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{block.title}</p>
                  <p className="text-xs text-slate-500">{block.category}</p>
                </div>

                {/* Days chips */}
                <div className="hidden lg:flex items-center gap-1">
                  {block.days.map(d => (
                    <span key={d} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-400">{d}</span>
                  ))}
                </div>

                <ContextMenu
                  items={[
                    { label: 'Editar', icon: <Pencil size={14} />, onClick: () => openEdit(block) },
                    { label: 'Remover', icon: <Trash2 size={14} />, onClick: () => setDeleteId(block.id), danger: true },
                  ]}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Atividade na Rotina">
        <RoutineForm form={form} setForm={setForm} toggleDay={toggleDay} onSubmit={handleCreate} label="Adicionar" />
      </Modal>
      <Modal open={!!editBlock} onClose={() => setEditBlock(null)} title="Editar Atividade">
        <RoutineForm form={form} setForm={setForm} toggleDay={toggleDay} onSubmit={handleEdit} label="Salvar" />
      </Modal>
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteRoutineBlock(deleteId)} title="Remover Atividade" confirmLabel="Remover" danger />
    </PageLayout>
  );
}

function RoutineForm({ form, setForm, toggleDay, onSubmit, label }: any) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label="Atividade">
        <input className={inputClass} placeholder="Ex: Estudo Cálculo I" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus required />
      </FormField>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Horário">
          <input type="time" className={inputClass} value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
        </FormField>
        <FormField label="Duração (min)">
          <input type="number" className={inputClass} min={5} step={5} value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
        </FormField>
        <FormField label="Categoria">
          <select className={selectClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {['Estudo', 'Exercício', 'Trabalho', 'Lazer', 'Alimentação', 'Sono', 'Outro'].map(c => <option key={c}>{c}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Dias da semana">
        <div className="flex items-center gap-2 flex-wrap">
          {(['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'] as RoutineDay[]).map(d => (
            <button type="button" key={d} onClick={() => toggleDay(d)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors", form.days.includes(d) ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}
            >{d}</button>
          ))}
        </div>
      </FormField>
      <FormField label="Cor">
        <div className="flex items-center gap-3">
          {BLOCK_COLORS.map(c => (
            <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
              className={cn("w-7 h-7 rounded-full transition-all border-2", form.color === c ? "border-white scale-125" : "border-transparent")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </FormField>
      <SubmitButton>{label}</SubmitButton>
    </form>
  );
}
