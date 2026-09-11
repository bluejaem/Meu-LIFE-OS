import { useState, useEffect } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { Play, Pause, RotateCcw, Settings2, Check, Trash2, Sparkles } from 'lucide-react';
import { cn, formatSecondsToTime, parseTimeToSeconds } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { AmbientSoundPlayer } from './AmbientSoundPlayer';
import { JornadaConhecimento } from './JornadaConhecimento';
import { AnimatePresence, motion } from 'framer-motion';

type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak' | 'custom';

const GENTLE_QUOTES = [
  "Respire fundo. O aprendizado é uma jornada contínua, e este momento é só seu.",
  "Foco não é sobre perfeição, é sobre estar presente em uma única coisa de cada vez.",
  "A clareza floresce na calma. Avance no seu próprio ritmo, sem cobranças excessivas.",
  "Cada minuto de atenção sincera é uma semente plantada na sua melhor versão.",
  "Gentileza com sua mente: a consistência diária supera qualquer esforço exaustivo.",
  "Desconecte-se do ruído exterior. Agora é o seu espaço de curiosidade e evolução.",
  "Cometer erros e ter dúvidas é o coração do aprendizado. Siga com calma e curiosidade.",
  "Você já deu o passo mais importante ao começar. Confie no seu processo.",
];

export function Pomodoro() {
  const { 
    pomodoroSessions, tasks, deletePomodoroSession,
    pomodoroMode: mode, pomodoroSecondsLeft: secondsLeft, 
    pomodoroIsRunning: isRunning, pomodoroSelectedTask: selectedTask,
    pomodoroDurations, setPomodoroState, setPomodoroDurations
  } = useStore();
  
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutes, setEditMinutes] = useState('');
  const [currentQuote, setCurrentQuote] = useState(() => GENTLE_QUOTES[0]);

  // Sorteia uma frase acolhedora toda vez que o Pomodoro iniciar o ciclo
  useEffect(() => {
    if (isRunning) {
      const randomIndex = Math.floor(Math.random() * GENTLE_QUOTES.length);
      setCurrentQuote(GENTLE_QUOTES[randomIndex]);
    }
  }, [isRunning]);

  const MODE_CONFIG = {
    focus: { minutes: pomodoroDurations.focus, label: 'Foco', color: '#10b981' },
    shortBreak: { minutes: pomodoroDurations.shortBreak, label: 'Pausa Curta', color: '#3b82f6' },
    longBreak: { minutes: pomodoroDurations.longBreak, label: 'Pausa Longa', color: '#8b5cf6' },
    custom: { minutes: pomodoroDurations.custom, label: 'Estudo Personalizado', color: '#f59e0b' },
  };
  
  const sessions = pomodoroSessions.filter(s => s.date === new Date().toISOString().split('T')[0]).length;

  const config = MODE_CONFIG[mode as PomodoroMode];
  const totalSeconds = config.minutes * 60;

  const switchMode = (m: PomodoroMode) => {
    setPomodoroState({
      pomodoroMode: m,
      pomodoroSecondsLeft: MODE_CONFIG[m].minutes * 60,
      pomodoroIsRunning: false
    });
    setIsEditingTime(false);
  };

  const reset = () => setPomodoroState({ pomodoroSecondsLeft: config.minutes * 60, pomodoroIsRunning: false });
  const displayTime = formatSecondsToTime(secondsLeft);
  
  const handleTimeClick = () => {
    if (!isRunning && mode === 'custom') {
      setEditMinutes(formatSecondsToTime(config.minutes * 60));
      setIsEditingTime(true);
    }
  };
  
  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSecs = parseTimeToSeconds(editMinutes);
    if (totalSecs > 0) {
      const newMins = Math.round(totalSecs / 60);
      setPomodoroDurations({ [mode]: newMins });
      setPomodoroState({ pomodoroSecondsLeft: totalSecs });
    }
    setIsEditingTime(false);
  };

  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 140;
  const dashOffset = circumference - (progress / 100) * circumference;

  const todaySessions = pomodoroSessions.filter(s => s.date === new Date().toISOString().split('T')[0]);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const pendingTasks = tasks.filter(t => !t.done);

  return (
    <PageLayout title="Pomodoro" subtitle="Técnica de foco e produtividade">
      <div className="flex flex-col lg:flex-row gap-8 h-full pb-8 overflow-hidden">
        {/* Timer Column */}
        <div className="flex-1 flex flex-col items-center justify-start pt-2 overflow-y-auto scrollbar-hide pb-12">
          {/* Mode Tabs */}
          <div className="glass-panel flex p-1 mb-6 rounded-full shrink-0">
            {(Object.keys(MODE_CONFIG) as PomodoroMode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  "px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300",
                  mode === m ? "bg-white/15 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
              >
                {MODE_CONFIG[m].label}
              </button>
            ))}
          </div>

          {/* Frase Motivacional Acolhedora ao Iniciar */}
          <AnimatePresence>
            {isRunning && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full max-w-md mb-6 px-4 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md flex items-center gap-3 text-left shadow-lg shadow-indigo-500/5 shrink-0"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                  <Sparkles size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-0.5">
                    Modo Foco Gentil
                  </span>
                  <p className="text-xs text-slate-200 leading-snug italic font-medium">
                    "{currentQuote}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Circular Timer */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-8 shrink-0">
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000"
              style={{ backgroundColor: config.color, opacity: isRunning ? 0.35 : 0.15 }}
            />
            {/* SVG ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 300 300">
              <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="150" cy="150" r="140" fill="none"
                stroke={config.color} strokeWidth="6"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            {/* Timer Display */}
            <div className="relative z-10 flex flex-col items-center">
              {isEditingTime ? (
                <form onSubmit={handleTimeSubmit} className="flex flex-col items-center mb-1">
                  <input
                    type="text"
                    autoFocus
                    value={editMinutes}
                    onChange={e => setEditMinutes(e.target.value)}
                    onBlur={handleTimeSubmit}
                    placeholder="00:00:00"
                    className="w-48 bg-black/30 border border-white/20 rounded-lg text-center text-[44px] font-light text-white outline-none focus:border-indigo-500 py-0"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 absolute -bottom-5 whitespace-nowrap">Enter para salvar (HH:MM:SS)</span>
                </form>
              ) : (
                <div className="text-[58px] sm:text-[66px] font-light text-white tracking-tighter leading-none">
                  {displayTime}
                </div>
              )}
              <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-widest mt-2">{config.label}</span>
              {sessions > 0 && <span className="text-[11px] text-slate-500 mt-1">{sessions} sessão{sessions > 1 ? 'ões' : ''} hoje</span>}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mb-6 shrink-0">
            <button 
              onClick={handleTimeClick} 
              disabled={mode !== 'custom'}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                mode === 'custom' ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-600 cursor-not-allowed opacity-50"
              )}
              title="Editar tempo personalizado"
            >
              <Settings2 size={20} />
            </button>
            <button
              onClick={() => {
                if (!isRunning && 'Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                  Notification.requestPermission();
                }
                setPomodoroState({ pomodoroIsRunning: !isRunning });
              }}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={reset} className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Task selector */}
          {pendingTasks.length > 0 && (
            <div className="mb-6 w-full max-w-sm shrink-0">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 text-center">Focando em</p>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-center [&>option]:bg-[#0c0e16]"
                value={selectedTask || ''}
                onChange={e => setPomodoroState({ pomodoroSelectedTask: e.target.value })}
              >
                <option value="">— Sessão livre —</option>
                {pendingTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          )}

          {/* Mini-Player de Sons Ambiente: Modo Foco Gentil */}
          <div className="w-full max-w-sm shrink-0">
            <AmbientSoundPlayer isPomodoroRunning={isRunning} />
          </div>
        </div>

        {/* Right Column: Jornada do Conhecimento & History */}
        <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto scrollbar-hide shrink-0 pb-12">
          {/* Jornada do Conhecimento Compacta */}
          <JornadaConhecimento variant="compact" />

          <div className="glass-panel p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-slate-200">Histórico de Hoje</h3>
              <p className="text-xs text-slate-500">{todayMinutes}min registradas</p>
            </div>

          {todaySessions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-6">
              <p className="text-sm text-slate-600 text-center">Inicie uma sessão de foco para registrar aqui.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todaySessions.map(s => (
                <div key={s.id} className="group flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/8 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Check size={14} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200 max-w-[130px] truncate">{s.label || 'Sessão'}</p>
                      <p className="text-[11px] text-slate-500">{s.duration}min</p>
                    </div>
                  </div>
                  <button onClick={() => deletePomodoroSession(s.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

