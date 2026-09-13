import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn, formatDateLocal } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { ContextMenu } from '../ui/ContextMenu';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function Calendario() {
  const { tasks, updateTask } = useStore(useShallow(state => ({
    tasks: state.tasks,
    updateTask: state.updateTask
  })));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = formatDateLocal();

  const dateStr = (day: number) => `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const tasksForDay = (day: number) => tasks.filter(t => t.date === dateStr(day) && !t.done);
  
  const selectedDayTasks = selectedDay ? tasks.filter(t => t.date === selectedDay && !t.done) : [];

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
                const dayTasks = day ? tasksForDay(day) : [];
                const totalItems = dayTasks.length;
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
                    </div>
                    
                    {/* Tarefas */}
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded truncate text-white"
                        style={{ backgroundColor: `#6366f133`, border: `1px solid #6366f140` }}
                      >
                        {task.title}
                      </div>
                    ))}

                    {totalItems > 3 && <span className="text-[10px] text-slate-500">+{totalItems - 3}</span>}
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
            </div>
            
            {selectedDayTasks.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Nenhuma tarefa pendente para este dia.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedDayTasks.map(task => (
                  <div key={task.id} className="group flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/8 transition-colors">
                    <div className="w-1 rounded-full self-stretch bg-indigo-500" />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-semibold text-slate-200 leading-snug">{task.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Tarefa • {task.tag}</p>
                    </div>
                    <ContextMenu
                      items={[
                        { label: 'Marcar como Concluída', icon: <Clock size={14} />, onClick: () => updateTask(task.id, { done: true }) }
                      ]}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
