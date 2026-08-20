import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { ChevronLeft, ChevronRight, Plus, Clock, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { CalendarEvent } from '@/types';
import { Modal, ConfirmModal, FormField, inputClass, SubmitButton } from '../ui/Modal';
import { ContextMenu } from '../ui/ContextMenu';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const EVENT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

const EMPTY_FORM = { title: '', subtitle: '', date: '', time: '09:00', color: '#6366f1' };

export function Calendario() {
  const { events, tasks, routine, addEvent, updateEvent, deleteEvent } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [, setCreateDate] = useState('');
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const dateStr = (day: number) => `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const eventsForDay = (day: number) => events.filter(e => e.date === dateStr(day));
  const tasksForDay = (day: number) => tasks.filter(t => t.date === dateStr(day));
  
  const getRoutineForDate = (dateString: string) => {
    const d = new Date(dateString + 'T12:00:00'); // Evita timezone offset issues
    const weekDay = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()];
    return routine.filter(r => r.days.includes(weekDay as any) || r.days.includes('Todos'));
  };

  const openCreate = (day?: number) => {
    const d = day ? dateStr(day) : todayStr;
    setCreateDate(d);
    setForm({ ...EMPTY_FORM, date: d });
    setCreateOpen(true);
  };
  const openEdit = (ev: CalendarEvent) => {
    setEditEvent(ev);
    setForm({ title: ev.title, subtitle: ev.subtitle || '', date: ev.date, time: ev.time, color: ev.color });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addEvent(form);
    setCreateOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEvent || !form.title.trim()) return;
    updateEvent(editEvent.id, form);
    setEditEvent(null);
  };

  const selectedDayEvents = selectedDay ? events.filter(e => e.date === selectedDay) : [];
  const selectedDayTasks = selectedDay ? tasks.filter(t => t.date === selectedDay) : [];
  const selectedDayRoutines = selectedDay ? getRoutineForDate(selectedDay) : [];

  return (
    <PageLayout title="Calendário" subtitle="Visão geral de seus eventos e prazos">
      <div className="flex h-full gap-8 overflow-hidden pb-4">
        
        {/* Main Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-xl font-bold text-white capitalize">{monthName}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"><ChevronLeft size={16}/></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 text-xs font-semibold text-slate-300 hover:text-white">Hoje</button>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"><ChevronRight size={16}/></button>
              </div>
              <button onClick={() => openCreate()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-lg">
                <Plus size={16} /> Novo Evento
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            {/* Headers */}
            <div className="grid grid-cols-7 border-b border-white/10 bg-black/40">
              {DAYS_OF_WEEK.map(d => (
                <div key={d} className="py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">{d}</div>
              ))}
            </div>
            
            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
              {cells.map((day, i) => {
                const ds = day ? dateStr(day) : null;
                const dayEvents = day ? eventsForDay(day) : [];
                const dayTasks = day ? tasksForDay(day) : [];
                const dayRoutines = ds ? getRoutineForDate(ds) : [];
                const totalItems = dayEvents.length + dayTasks.length + dayRoutines.length;
                const isToday = ds === todayStr;
                const isSelected = ds === selectedDay;

                return (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDay(ds === selectedDay ? null : ds!)}
                    className={cn(
                      "border-r border-b border-white/5 p-1.5 flex flex-col gap-1 min-h-[80px]",
                      day && "cursor-pointer hover:bg-white/5 transition-colors",
                      !day && "opacity-20",
                      isSelected && "bg-indigo-500/5 border-indigo-500/20",
                      i % 7 === 6 && "border-r-0"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full",
                        isToday ? "bg-indigo-500 text-white font-bold" : "text-slate-400"
                      )}>
                        {day}
                      </span>
                      {day && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openCreate(day); }}
                          className="opacity-0 hover:opacity-100 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-white hover:bg-white/10 transition-all text-xs"
                        >
                          +
                        </button>
                      )}
                    </div>
                    {/* Eventos */}
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded truncate text-white"
                        style={{ backgroundColor: `${ev.color}33`, border: `1px solid ${ev.color}40` }}
                      >
                        {ev.time} {ev.title}
                      </div>
                    ))}
                    {/* Tarefas */}
                    {dayEvents.length < 2 && dayTasks.slice(0, 2 - dayEvents.length).map(task => (
                      <div
                        key={task.id}
                        className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded truncate text-white", task.done ? "line-through opacity-50" : "")}
                        style={{ backgroundColor: `#6366f133`, border: `1px solid #6366f140` }}
                      >
                        ☑ {task.title}
                      </div>
                    ))}
                    {/* Rotinas */}
                    {dayEvents.length + dayTasks.length < 2 && dayRoutines.slice(0, 2 - (dayEvents.length + dayTasks.length)).map(r => (
                      <div
                        key={r.id}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded truncate text-white"
                        style={{ backgroundColor: `${r.color || '#8b5cf6'}33`, border: `1px solid ${r.color || '#8b5cf6'}40` }}
                      >
                        ↻ {r.time} {r.title}
                      </div>
                    ))}
                    {totalItems > 2 && <span className="text-[10px] text-slate-500">+{totalItems - 2}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side panel: events for selected day */}
        {selectedDay && (
          <div className="w-72 glass-panel p-5 flex flex-col gap-4 overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">
                {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <button onClick={() => openCreate(parseInt(selectedDay.split('-')[2]))} className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 transition-colors">
                <Plus size={14} />
              </button>
            </div>
            
            {selectedDayEvents.length === 0 && selectedDayTasks.length === 0 && selectedDayRoutines.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Sem agendamentos para este dia.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedDayEvents.sort((a, b) => a.time.localeCompare(b.time)).map(ev => (
                  <div key={ev.id} className="group flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/8 transition-colors">
                    <div className="w-1 rounded-full self-stretch" style={{ backgroundColor: ev.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                        <Clock size={10} /> {ev.time}
                      </div>
                      <p className="text-sm font-semibold text-slate-200 leading-snug">{ev.title}</p>
                      {ev.subtitle && <p className="text-xs text-slate-500 mt-0.5">{ev.subtitle}</p>}
                    </div>
                    <ContextMenu
                      items={[
                        { label: 'Editar', icon: <Pencil size={14} />, onClick: () => openEdit(ev) },
                        { label: 'Excluir', icon: <Trash2 size={14} />, onClick: () => setDeleteId(ev.id), danger: true },
                      ]}
                    />
                  </div>
                ))}
                
                {selectedDayRoutines.sort((a, b) => a.time.localeCompare(b.time)).map(r => (
                  <div key={r.id} className="group flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/8 transition-colors">
                    <div className="w-1 rounded-full self-stretch" style={{ backgroundColor: r.color || '#8b5cf6' }} />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                        <Clock size={10} /> {r.time}
                      </div>
                      <p className="text-sm font-semibold text-slate-200 leading-snug">{r.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Rotina • {r.category}</p>
                    </div>
                  </div>
                ))}

                {selectedDayTasks.map(task => (
                  <div key={task.id} className={cn("group flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/8 transition-colors", task.done ? "opacity-50" : "")}>
                    <div className="w-1 rounded-full self-stretch bg-indigo-500" />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className={cn("text-sm font-semibold text-slate-200 leading-snug", task.done ? "line-through" : "")}>{task.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Tarefa • {task.tag}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Evento">
        <EventForm form={form} setForm={setForm} onSubmit={handleCreate} label="Criar Evento" />
      </Modal>
      <Modal open={!!editEvent} onClose={() => setEditEvent(null)} title="Editar Evento">
        <EventForm form={form} setForm={setForm} onSubmit={handleEdit} label="Salvar" />
      </Modal>
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteEvent(deleteId)} title="Excluir Evento" confirmLabel="Excluir" danger />
    </PageLayout>
  );
}

function EventForm({ form, setForm, onSubmit, label }: any) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label="Título">
        <input className={inputClass} placeholder="Nome do evento" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus required />
      </FormField>
      <FormField label="Local / Descrição (opcional)">
        <input className={inputClass} placeholder="Google Meet, Sala 21..." value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Data">
          <input type="date" className={inputClass} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        </FormField>
        <FormField label="Hora">
          <input type="time" className={inputClass} value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
        </FormField>
      </div>
      <FormField label="Cor">
        <div className="flex items-center gap-3 h-9">
          {EVENT_COLORS.map(c => (
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
