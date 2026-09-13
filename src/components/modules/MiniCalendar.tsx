import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatDateLocal } from '@/lib/utils';
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

  const todayStr = formatDateLocal();
  
  const dateStr = (day: number) => `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const tasksForDay = (day: number) => tasks.filter(t => t.date === dateStr(day) && !t.done);
  
  const selectedDayTasks = selectedDay ? tasks.filter(t => t.date === selectedDay && !t.done) : [];

  return (
    <div className="flex flex-col relative z-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[13px] font-bold text-white capitalize tracking-wide">{monthName}</h3>
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><ChevronLeft size={14}/></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-2 text-[10px] font-semibold text-slate-300 hover:text-white transition-colors uppercase tracking-wider">Hoje</button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><ChevronRight size={14}/></button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-black/40">
          {DAYS_OF_WEEK.map((d, i) => (
            <div key={i} className="py-2 text-center text-[10px] font-bold text-slate-500">{d}</div>
          ))}
        </div>
        
        {/* Cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const ds = day ? dateStr(day) : null;
            const pending = day ? tasksForDay(day) : [];
            const hasPending = pending.length > 0;
            const isToday = ds === todayStr;
            const isSelected = ds === selectedDay;

            return (
              <div
                key={i}
                onClick={() => {
                  if (day && hasPending) {
                    setSelectedDay(ds === selectedDay ? null : ds!);
                  } else if (day) {
                    setSelectedDay(null);
                  }
                }}
                className={cn(
                  "border-r border-b border-white/5 p-1 flex flex-col items-center justify-center aspect-square transition-all",
                  day && "cursor-pointer hover:bg-white/5",
                  !day && "opacity-20",
                  isSelected && "bg-indigo-500/10 border-indigo-500/30",
                  i % 7 === 6 && "border-r-0",
                  i >= cells.length - 7 && "border-b-0"
                )}
              >
                {day && (
                  <div className={cn(
                    "w-7 h-7 flex items-center justify-center text-[11px] font-medium rounded-full relative",
                    isToday ? "bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25" : "text-slate-300",
                    isSelected && !isToday && "bg-indigo-500/20 text-indigo-400 font-bold"
                  )}>
                    {day}
                    {hasPending && !isToday && (
                      <span className={cn(
                        "absolute -bottom-0.5 w-1 h-1 rounded-full",
                        isSelected ? "bg-indigo-400" : "bg-indigo-500"
                      )} />
                    )}
                    {hasPending && isToday && (
                      <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-white" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Popover de Tarefas */}
      <AnimatePresence>
        {selectedDay && selectedDayTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-3xl p-4 border border-white/10 shadow-2xl origin-top rounded-2xl"
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
