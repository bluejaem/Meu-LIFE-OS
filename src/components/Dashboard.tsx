import { useState, useEffect } from 'react';
import { 
  CheckSquare, FolderKanban, Clock, Flame, MoreHorizontal,
  Play, Pause, TrendingUp, RotateCcw, Settings2
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { cn, formatSecondsToTime, parseTimeToSeconds } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModalAddStudy } from '@/components/modules/ModalAddStudy';

export function Dashboard({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutes, setEditMinutes] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const { 
    tasks, projects, pomodoroSessions, goals, getWeeklyProductivity, getUpcomingEvents,
    pomodoroSecondsLeft, pomodoroIsRunning, pomodoroMode, pomodoroDurations, 
    setPomodoroState, setPomodoroDurations, toggleTask, getWeeklyStudyProgress
  } = useStore();
  const chartData = getWeeklyProductivity();
  const upcomingEvents = getUpcomingEvents();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const doneTodayTasks = todayTasks.filter(t => t.done);
  
  const doneTasks = tasks.filter(t => t.done).length;

  const completedProjects = projects.filter(p => p.status === 'Concluído');
  
  const todaySessions = pomodoroSessions.filter(s => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const studyProgress = getWeeklyStudyProgress();
  const studyHours = Math.floor(studyProgress.totalMinutes / 60);
  const studyMinutes = studyProgress.totalMinutes % 60;
  const studyGoalHours = studyProgress.goalMinutes / 60;

  // Sequência de dias com pelo menos 1 tarefa concluída
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const hasActivity = tasks.some(t => t.done && t.createdAt.startsWith(ds)) || pomodoroSessions.some(p => p.date === ds);
    if (hasActivity) streak++;
    else if (i > 0) break;
  }

  const todayGoals = goals.slice(0, 3);
  const greeting = currentTime.getHours() < 12 ? 'Bom dia' : currentTime.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
  const dayLabel = format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR });
  const weekLabel = `Semana ${format(currentTime, 'w')}`;
  const timeLabel = format(currentTime, 'HH:mm:ss');

  const { settings } = useStore();
  const firstName = settings.userName.split(' ')[0];

  type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak' | 'custom';
  const MODE_CONFIG = {
    focus: { minutes: pomodoroDurations.focus, label: 'Foco' },
    shortBreak: { minutes: pomodoroDurations.shortBreak, label: 'Pausa Curta' },
    longBreak: { minutes: pomodoroDurations.longBreak, label: 'Pausa Longa' },
    custom: { minutes: pomodoroDurations.custom, label: 'Estudo Personalizado' },
  };
  const pomoConfig = MODE_CONFIG[pomodoroMode as PomodoroMode];

  const switchMode = (m: PomodoroMode) => {
    setPomodoroState({
      pomodoroMode: m,
      pomodoroSecondsLeft: MODE_CONFIG[m].minutes * 60,
      pomodoroIsRunning: false
    });
    setIsEditingTime(false);
  };

  const resetPomo = () => setPomodoroState({ pomodoroSecondsLeft: pomoConfig.minutes * 60, pomodoroIsRunning: false });

  const handleTimeClick = () => {
    if (!pomodoroIsRunning && pomodoroMode === 'custom') {
      setEditMinutes(formatSecondsToTime(pomoConfig.minutes * 60));
      setIsEditingTime(true);
    }
  };
  
  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSecs = parseTimeToSeconds(editMinutes);
    if (totalSecs > 0) {
      const newMins = Math.round(totalSecs / 60);
      setPomodoroDurations({ [pomodoroMode]: newMins });
      setPomodoroState({ pomodoroSecondsLeft: totalSecs });
    }
    setIsEditingTime(false);
  };

  const displayTime = formatSecondsToTime(pomodoroSecondsLeft);

  return (
    <div className="flex flex-col xl:flex-row h-full w-full overflow-y-auto xl:overflow-hidden scrollbar-hide">
      <ModalAddStudy isOpen={isStudyModalOpen} onClose={() => setIsStudyModalOpen(false)} />
      {/* Main Column */}
      <div className="flex-1 flex flex-col px-5 xl:px-10 py-6 xl:py-8 overflow-y-visible xl:overflow-y-auto scrollbar-hide gap-6 xl:gap-8">

        {/* Header */}
        <header className="flex flex-col gap-1.5 shrink-0">
          <h2 className="text-[28px] font-bold text-slate-100 tracking-tight">
            {greeting}, {firstName}!
          </h2>
          <div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium capitalize">
            <span>{dayLabel}</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>{weekLabel}</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-slate-300 font-semibold">{timeLabel}</span>
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
          <MetricCard
            title="Tarefas"
            value={`${doneTodayTasks.length}`}
            total={todayTasks.length > 0 ? String(todayTasks.length) : undefined}
            subtitle="Concluídas hoje"
            icon={<CheckSquare size={14} className="text-emerald-400" />}
            trend={doneTasks > 0 ? `${doneTasks} total` : undefined}
          />
          <MetricCard
            title="Projetos"
            value={String(completedProjects.length)}
            total={String(projects.length)}
            subtitle="Concluídos"
            icon={<FolderKanban size={14} className="text-indigo-400" />}
          />
          <MetricCard
            title="Estudo Semanal"
            value={`${studyHours}h${studyMinutes > 0 ? `${studyMinutes}m` : ''}`}
            total={`${studyGoalHours}h`}
            subtitle="Clique para adicionar manual"
            icon={<Clock size={14} className="text-blue-400" />}
            trend={`${studyProgress.percentage}%`}
            onClick={() => setIsStudyModalOpen(true)}
          />
          <MetricCard
            title="Sequência"
            value={String(streak)}
            subtitle="Dias consecutivos"
            icon={<Flame size={14} className="text-orange-400" />}
          />
        </div>

        {/* Chart */}
        <div className="glass-panel p-6 flex flex-col shrink-0 h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-[13px] text-slate-200 uppercase tracking-wider">Produtividade Semanal</h3>
            <div className="flex gap-4 text-[12px] font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Tarefas
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Horas
              </span>
            </div>
          </div>
          <div className="flex-1 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gTarefas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gHoras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dx={-10} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(12,14,22,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px', backdropFilter: 'blur(20px)' }} itemStyle={{ color: '#e2e8f0' }} />
                <Area type="monotone" dataKey="tarefas" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#gTarefas)" activeDot={{ r: 4, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="horas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gHoras)" activeDot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0 pb-10">
          {/* Goals */}
          <div className="glass-panel p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[13px] text-slate-200 uppercase tracking-wider">Metas</h3>
              <button className="text-slate-500 hover:text-slate-300 transition-colors"><MoreHorizontal size={16} /></button>
            </div>
            {todayGoals.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Nenhuma meta criada ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {todayGoals.map((g, idx) => {
                  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500'];
                  return <GoalItem key={g.id} title={g.title} progress={`${g.progress}%`} percent={g.progress} color={colors[idx % colors.length]} />;
                })}
              </div>
            )}
          </div>

          {/* Pomodoro Quick */}
          <div className="glass-panel p-5 relative overflow-hidden group flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Mode Tabs */}
              <div className="flex gap-1 mb-4 bg-black/20 p-1 rounded-full">
                {(Object.keys(MODE_CONFIG) as PomodoroMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300",
                      pomodoroMode === m ? "bg-white/20 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {MODE_CONFIG[m].label}
                  </button>
                ))}
              </div>

              {/* Timer */}
              {isEditingTime ? (
                <form onSubmit={handleTimeSubmit} className="flex flex-col items-center mb-1">
                  <input
                    type="text"
                    autoFocus
                    value={editMinutes}
                    onChange={e => setEditMinutes(e.target.value)}
                    onBlur={handleTimeSubmit}
                    placeholder="00:00:00"
                    className="w-36 bg-black/30 border border-white/20 rounded-lg text-center text-[42px] font-light text-white outline-none focus:border-indigo-500 py-0"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 absolute -bottom-4 whitespace-nowrap">Enter para salvar (HH:MM:SS)</span>
                </form>
              ) : (
                <div className="text-[52px] font-light text-white tracking-tighter leading-none mb-1">
                  {displayTime}
                </div>
              )}
              <p className="text-xs text-slate-500 mb-5 mt-2">{todaySessions.length} sessão{todaySessions.length !== 1 ? 'ões' : ''} hoje · {todayMinutes}min</p>
              
              {/* Controls */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleTimeClick} 
                  disabled={pomodoroMode !== 'custom'}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    pomodoroMode === 'custom' ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-600 cursor-not-allowed opacity-50"
                  )}
                  title="Editar tempo personalizado"
                >
                  <Settings2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (!pomodoroIsRunning && 'Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                      Notification.requestPermission();
                    }
                    setPomodoroState({ pomodoroIsRunning: !pomodoroIsRunning });
                  }}
                  className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  {pomodoroIsRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={resetPomo} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full xl:w-[300px] flex-shrink-0 border-t xl:border-t-0 xl:border-l border-white/5 bg-black/20 backdrop-blur-3xl p-6 xl:overflow-y-auto scrollbar-hide flex flex-col gap-8 shadow-2xl">

        {/* Profile */}
        <div className="flex justify-end">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">{settings.userName}</span>
            <img 
              src={settings.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(settings.userName)}&background=6366f1&color=fff`} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full object-cover object-top border border-white/10" 
            />
          </div>
        </div>

        {/* Today's Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tarefas de Hoje</h3>
            <span className="text-xs text-slate-500">{doneTodayTasks.length}/{todayTasks.length}</span>
          </div>
          {todayTasks.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-4">Nenhuma tarefa para hoje.</p>
          ) : (
            <div className="space-y-2">
              {todayTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-start gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group" onClick={() => toggleTask(task.id)}>
                  <div className={cn("mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors", task.done ? "border-indigo-500 bg-indigo-500" : "border-slate-600 group-hover:border-slate-400")}>
                    {task.done && <CheckSquare size={10} className="text-white" />}
                  </div>
                  <span className={cn("text-xs font-medium leading-snug", task.done ? "line-through text-slate-500" : "text-slate-300")}>{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Próximos Eventos</h3>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-4">Nenhum evento próximo.</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(ev => {
                const isToday = ev.date === todayStr;
                return <EventItem key={ev.id} time={ev.time} title={ev.title} subtitle={ev.subtitle} date={isToday ? 'Hoje' : ev.date} color={ev.color} onClick={() => setActiveTab?.('calendario')} />;
              })}
            </div>
          )}
        </div>

        {/* Quote */}
        <div className="glass-panel p-5 relative overflow-hidden border-white/10 bg-white/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50" />
          <p className="text-[13px] font-medium text-slate-300 leading-relaxed italic mb-3">"Disciplina hoje, liberdade amanhã."</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            <span className="w-4 h-[1px] bg-slate-600" />
            Sua melhor versão
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function MetricCard({ title, value, total, subtitle, icon, trend, onClick }: any) {
  return (
    <div 
      className={cn("glass-panel p-4 flex flex-col group transition-colors duration-300", onClick ? "cursor-pointer hover:bg-white/10" : "hover:bg-white/5")}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4 text-slate-400">
        <span className="text-[12px] font-medium tracking-wide">{title}</span>
        {icon}
      </div>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-[26px] font-semibold text-white leading-none tracking-tight">{value}</span>
        {total && <span className="text-sm font-medium text-slate-500 mb-0.5">/ {total}</span>}
      </div>
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-[11px] text-slate-500 font-medium">{subtitle}</span>
        {trend && (
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
            <TrendingUp size={10} /> {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function GoalItem({ title, progress, percent, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-2 font-medium">
        <span className="text-slate-300 truncate">{title}</span>
        <span className="text-slate-500 ml-2 flex-shrink-0">{progress}</span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function EventItem({ time, title, subtitle, date, color, onClick }: any) {
  return (
    <div onClick={onClick} className="group flex gap-3 p-2.5 -mx-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
      <div className="flex flex-col items-end shrink-0 w-12 pt-0.5">
        <span className="text-[11px] font-bold text-slate-300 leading-none">{time}</span>
        <span className="text-[9px] font-semibold text-slate-500 mt-1 uppercase">{date}</span>
      </div>
      <div className="w-[1px] bg-white/10 shrink-0 relative">
        <div className="absolute top-1 -left-[3px] w-1.5 h-1.5 rounded-full border-2 border-navy-bg transition-colors" style={{ backgroundColor: color }} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-medium text-slate-200 leading-snug truncate">{title}</span>
        {subtitle && <span className="text-[11px] text-slate-500">{subtitle}</span>}
      </div>
    </div>
  );
}
