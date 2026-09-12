import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { AnimatePresence, motion } from 'framer-motion';

const DAYS_OF_WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function MiniCalendar() {
  const { tasks, toggleTask } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
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
  const tasksForDay = (day: number) => tasks.filter(t => t.date === dateStr(day) && !t.done);
  
  const selectedDayTasks = selectedDay ? tasks.filter(t => t.date === selectedDay && !t.done) : [];

  return (
    <div className="glass-panel p-5 relative flex flex-col z-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-slate-200 capitalize tracking-wide">{monthName}</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><ChevronLeft size={14}/></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-2 text-[10px] font-semibold text-slate-300 hover:text-white transition-colors uppercase tracking-wider">Hoje</button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><ChevronRight size={14}/></button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_OF_WEEK.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-slate-500">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-y-1 gap-x-1">
        {cells.map((day, i) => {
          const ds = day ? dateStr(day) : null;
          const pending = day ? tasksForDay(day) : [];
          const hasPending = pending.length > 0;
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDay;

          return (
            <button
              key={i}
              onClick={() => {
                if (day && hasPending) {
                  setSelectedDay(ds === selectedDay ? null : ds!);
                } else if (day) {
                  setSelectedDay(null);
                }
              }}
              disabled={!day}
              className={cn(
                "relative flex items-center justify-center h-8 rounded-lg text-xs font-medium transition-all duration-300",
                !day && "opacity-0 cursor-default",
                day && !isSelected && !isToday && "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                isToday && !isSelected && "bg-indigo-500/20 text-indigo-400 font-bold",
                isSelected && "bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25",
                hasPending && !isSelected && "hover:bg-white/10"
              )}
            >
              {day}
              {hasPending && (
                <span className={cn(
                  "absolute bottom-1 w-1 h-1 rounded-full",
                  isSelected ? "bg-white" : isToday ? "bg-indigo-400" : "bg-indigo-500"
                )} />
              )}
            </button>
          );
        })}
      </div>

      {/* Popover de Tarefas */}
      <AnimatePresence>
        {selectedDay && selectedDayTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 glass-panel p-4 border border-white/10 shadow-2xl origin-top rounded-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-hide">
              {selectedDayTasks.map(task => (
                <div key={task.id} className="flex items-start gap-2 p-2 bg-black/20 hover:bg-white/10 rounded-lg transition-colors cursor-pointer group" onClick={() => { toggleTask(task.id); setSelectedDay(null); }}>
                  <div className="mt-0.5 w-3.5 h-3.5 rounded border border-slate-500 group-hover:border-indigo-400 flex items-center justify-center flex-shrink-0 transition-colors">
                  </div>
                  <span className="text-[11px] font-medium leading-snug text-slate-300 group-hover:text-slate-100">{task.title}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
