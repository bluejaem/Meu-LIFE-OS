import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { firestoreStorage } from '@/lib/firestoreStorage';
import { startOfWeek } from 'date-fns';
import type {
  Task, Project, CalendarEvent, Goal, Book,
  Certification, RoutineBlock, DiaryEntry, PomodoroSession,
  College, AcademicSubject, AppSettings, RoutineDay,
  KnowledgeJourneyData, KnowledgeJourneyStage, UserMilestone
} from '@/types';

// ─── Utility ──────────────────────────────────────────────────────────────────
const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().split('T')[0];

const initialCertifications: Certification[] = [];

const initialColleges: College[] = [];

// ─── Store Interface ──────────────────────────────────────────────────────────
interface AppStore {
  // Data
  tasks: Task[];
  projects: Project[];
  events: CalendarEvent[];
  goals: Goal[];
  books: Book[];
  certifications: Certification[];
  routine: RoutineBlock[];
  diary: DiaryEntry[];
  pomodoroSessions: PomodoroSession[];
  colleges: College[];
  settings: AppSettings;
  userMilestones: UserMilestone[];

  // ── Jornada do Conhecimento & Marcos
  checkAndUnlockMilestones: () => UserMilestone[];
  getKnowledgeJourney: () => KnowledgeJourneyData;

  // ── Tasks CRUD
  addTask: (data: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;

  // ── Projects CRUD
  addProject: (data: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // ── Events CRUD
  addEvent: (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // ── Goals CRUD
  addGoal: (data: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // ── Books CRUD
  addBook: (data: Omit<Book, 'id' | 'createdAt'>) => void;
  updateBook: (id: string, data: Partial<Book>) => void;
  deleteBook: (id: string) => void;

  // ── Certifications CRUD
  addCertification: (data: Omit<Certification, 'id' | 'createdAt'>) => void;
  updateCertification: (id: string, data: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;

  // ── Routine CRUD
  addRoutineBlock: (data: Omit<RoutineBlock, 'id'>) => void;
  updateRoutineBlock: (id: string, data: Partial<RoutineBlock>) => void;
  deleteRoutineBlock: (id: string) => void;
  clearRoutine: () => void;

  // ── Diary CRUD
  addDiaryEntry: (data: Omit<DiaryEntry, 'id' | 'createdAt'>) => void;
  updateDiaryEntry: (id: string, data: Partial<DiaryEntry>) => void;
  deleteDiaryEntry: (id: string) => void;

  // ── Pomodoro & Study
  pomodoroMode: 'focus' | 'shortBreak' | 'longBreak' | 'custom';
  pomodoroSecondsLeft: number;
  pomodoroIsRunning: boolean;
  pomodoroSelectedTask: string | null;
  pomodoroDurations: { focus: number; shortBreak: number; longBreak: number; custom: number };
  setPomodoroState: (state: Partial<{ pomodoroMode: 'focus' | 'shortBreak' | 'longBreak' | 'custom', pomodoroSecondsLeft: number, pomodoroIsRunning: boolean, pomodoroSelectedTask: string | null }>) => void;
  setPomodoroDurations: (durations: Partial<{ focus: number; shortBreak: number; longBreak: number; custom: number }>) => void;
  tickPomodoro: () => void;

  addPomodoroSession: (data: Omit<PomodoroSession, 'id' | 'createdAt'>) => void;
  deletePomodoroSession: (id: string) => void;
  addManualStudySession: (minutes: number, dateStr: string) => void;
  getWeeklyStudyProgress: () => { totalMinutes: number, goalMinutes: number, percentage: number };

  // ── Colleges CRUD
  addCollege: (data: Omit<College, 'id' | 'createdAt'>) => void;
  updateCollege: (id: string, data: Partial<College>) => void;
  deleteCollege: (id: string) => void;
  toggleSubjectReviewedToday: (collegeId: string, subjectId: string) => void;
  updateSubject: (collegeId: string, subjectId: string, data: Partial<AcademicSubject>) => void;

  // ── Settings
  updateSettings: (data: Partial<AppSettings>) => void;

  // ── Computed helpers
  getProjectProgress: (projectId: string) => number;
  getWeeklyProductivity: () => { name: string; tarefas: number; horas: number }[];
  getTodayTasks: () => Task[];
  getUpcomingEvents: () => CalendarEvent[];
}

// ─── Store Implementation ─────────────────────────────────────────────────────
export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────────────────
      tasks: [],
      projects: [],
      events: [],
      goals: [],
      books: [],
      certifications: initialCertifications,
      routine: [],
      diary: [],
      pomodoroSessions: [],
      colleges: initialColleges,
      userMilestones: [],
      settings: {
        theme: 'dark',
        wallpaperUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=3028&auto=format&fit=crop',
        userName: 'João Guilherme',
        accentColor: '#6366f1',
        language: 'pt-BR',
        notifications: true,
      },

      // Pomodoro Global State
      pomodoroMode: 'focus',
      pomodoroSecondsLeft: 25 * 60,
      pomodoroIsRunning: false,
      pomodoroSelectedTask: null,
      pomodoroDurations: { focus: 25, shortBreak: 5, longBreak: 15, custom: 50 },

      // ── Tasks ──────────────────────────────────────────────────────────────
      addTask: (data) => set((s) => ({
        tasks: [...s.tasks, { ...data, id: uid(), createdAt: now() }]
      })),
      updateTask: (id, data) => set((s) => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, ...data } : t)
      })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      toggleTask: (id) => set((s) => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
      })),
      duplicateTask: (id) => set((s) => {
        const task = s.tasks.find(t => t.id === id);
        if (!task) return s;
        return { tasks: [...s.tasks, { ...task, id: uid(), title: `${task.title} (cópia)`, done: false, createdAt: now() }] };
      }),
      toggleSubtask: (taskId, subtaskId) => set((s) => ({
        tasks: s.tasks.map(t => t.id === taskId
          ? { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, done: !st.done } : st) }
          : t
        )
      })),

      // ── Projects ───────────────────────────────────────────────────────────
      addProject: (data) => set((s) => ({
        projects: [...s.projects, { ...data, id: uid(), createdAt: now() }]
      })),
      updateProject: (id, data) => set((s) => ({
        projects: s.projects.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter(p => p.id !== id) })),

      // ── Events ─────────────────────────────────────────────────────────────
      addEvent: (data) => set((s) => ({
        events: [...s.events, { ...data, id: uid(), createdAt: now() }]
      })),
      updateEvent: (id, data) => set((s) => ({
        events: s.events.map(e => e.id === id ? { ...e, ...data } : e)
      })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter(e => e.id !== id) })),

      // ── Goals ──────────────────────────────────────────────────────────────
      addGoal: (data) => set((s) => ({
        goals: [...s.goals, { ...data, id: uid(), createdAt: now() }]
      })),
      updateGoal: (id, data) => set((s) => ({
        goals: s.goals.map(g => g.id === id ? { ...g, ...data } : g)
      })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter(g => g.id !== id) })),

      // ── Books ──────────────────────────────────────────────────────────────
      addBook: (data) => set((s) => ({
        books: [...s.books, { ...data, id: uid(), createdAt: now() }]
      })),
      updateBook: (id, data) => set((s) => ({
        books: s.books.map(b => b.id === id ? { ...b, ...data } : b)
      })),
      deleteBook: (id) => set((s) => ({ books: s.books.filter(b => b.id !== id) })),

      // ── Certifications ─────────────────────────────────────────────────────
      addCertification: (data) => set((s) => ({
        certifications: [...s.certifications, { ...data, id: uid(), createdAt: now() }]
      })),
      updateCertification: (id, data) => set((s) => ({
        certifications: s.certifications.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      deleteCertification: (id) => set((s) => ({
        certifications: s.certifications.filter(c => c.id !== id)
      })),

      // ── Routine ────────────────────────────────────────────────────────────
      addRoutineBlock: (data) => set((s) => ({
        routine: [...s.routine, { ...data, id: uid() }]
      })),
      updateRoutineBlock: (id, data) => set((s) => ({
        routine: s.routine.map(r => r.id === id ? { ...r, ...data } : r)
      })),
      deleteRoutineBlock: (id) => set((s) => ({
        routine: s.routine.filter(r => r.id !== id)
      })),
      clearRoutine: () => set(() => ({ routine: [] })),

      // ── Diary ──────────────────────────────────────────────────────────────
      addDiaryEntry: (data) => set((s) => ({
        diary: [...s.diary, { ...data, id: uid(), createdAt: now() }]
      })),
      updateDiaryEntry: (id, data) => set((s) => ({
        diary: s.diary.map(d => d.id === id ? { ...d, ...data } : d)
      })),
      deleteDiaryEntry: (id) => set((s) => ({
        diary: s.diary.filter(d => d.id !== id)
      })),

      // ── Pomodoro ───────────────────────────────────────────────────────────
      setPomodoroState: (state) => set((s) => ({ ...s, ...state })),
      setPomodoroDurations: (durations) => set((s) => ({
        pomodoroDurations: { ...s.pomodoroDurations, ...durations }
      })),
      
      tickPomodoro: () => set((s) => {
        if (!s.pomodoroIsRunning || s.pomodoroSecondsLeft <= 0) return s;
        const newSeconds = s.pomodoroSecondsLeft - 1;
        if (newSeconds === 0) {
          // Tocar som e enviar notificação
          try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
              const ctx = new AudioContext();
              const playBeep = (time: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, time);
                gain.gain.setValueAtTime(0.1, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(time);
                osc.stop(time + 0.25);
              };
              playBeep(ctx.currentTime);
              playBeep(ctx.currentTime + 0.3);
              playBeep(ctx.currentTime + 0.6);
            }
          } catch(e) {}

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Cronômetro Finalizado!', { 
              body: 'Seu tempo acabou. Volte para o LIFE OS!',
              icon: '/favicon.ico'
            });
          }

          if (s.pomodoroMode === 'focus' || s.pomodoroMode === 'custom') {
            const task = s.tasks.find(t => t.id === s.pomodoroSelectedTask);
            const modeDuration = s.pomodoroDurations[s.pomodoroMode];
            const newSession = {
              id: uid(),
              date: today(),
              duration: modeDuration, // Usa o tempo configurado do respectivo modo
              taskId: s.pomodoroSelectedTask || undefined,
              label: task ? task.title : (s.pomodoroMode === 'custom' ? 'Estudo Personalizado' : 'Sessão livre'),
              createdAt: now()
            };
            return { 
              pomodoroSecondsLeft: 0, 
              pomodoroIsRunning: false,
              pomodoroSessions: [...s.pomodoroSessions, newSession]
            };
          }
          return { pomodoroSecondsLeft: 0, pomodoroIsRunning: false };
        }
        return { pomodoroSecondsLeft: newSeconds };
      }),
      addPomodoroSession: (data) => set((s) => ({
        pomodoroSessions: [...s.pomodoroSessions, { ...data, id: uid(), createdAt: now() }]
      })),
      deletePomodoroSession: (id) => set((s) => ({
        pomodoroSessions: s.pomodoroSessions.filter(p => p.id !== id)
      })),
      addManualStudySession: (minutes, dateStr) => set((s) => ({
        pomodoroSessions: [...s.pomodoroSessions, {
          id: uid(),
          date: dateStr,
          duration: minutes,
          label: 'Estudo Manual',
          createdAt: now()
        }]
      })),
      getWeeklyStudyProgress: () => {
        const { pomodoroSessions } = get();
        // date-fns startOfWeek considering Monday as start of week (weekStartsOn: 1)
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekStartStr = weekStart.toISOString().split('T')[0];
        
        const currentWeekSessions = pomodoroSessions.filter(p => p.date >= weekStartStr);
        const totalMinutes = currentWeekSessions.reduce((acc, s) => acc + s.duration, 0);
        
        const goalMinutes = 1200; // 20 hours
        const percentage = Math.min(Math.round((totalMinutes / goalMinutes) * 100), 100);
        
        return { totalMinutes, goalMinutes, percentage };
      },

      // ── Colleges & Hub Acadêmico IA ─────────────────────────────────────────
      addCollege: (data) => set((s) => ({
        colleges: [...s.colleges, { ...data, id: uid(), createdAt: now() }]
      })),
      updateCollege: (id, data) => set((s) => ({
        colleges: s.colleges.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      deleteCollege: (id) => set((s) => ({
        colleges: s.colleges.filter(c => c.id !== id)
      })),
      toggleSubjectReviewedToday: (collegeId, subjectId) => set((s) => {
        const todayStr = new Date().toISOString().split('T')[0];
        return {
          colleges: s.colleges.map(col => {
            if (col.id !== collegeId) return col;
            return {
              ...col,
              subjects: col.subjects.map(subj => {
                if (subj.id !== subjectId) return subj;
                const isReviewedToday = subj.lastReviewedDate === todayStr;
                return {
                  ...subj,
                  lastReviewedDate: isReviewedToday ? undefined : todayStr
                };
              })
            };
          })
        };
      }),
      updateSubject: (collegeId, subjectId, data) => set((s) => ({
        colleges: s.colleges.map(col => {
          if (col.id !== collegeId) return col;
          return {
            ...col,
            subjects: col.subjects.map(subj => subj.id === subjectId ? { ...subj, ...data } : subj)
          };
        })
      })),

      // ── Settings ───────────────────────────────────────────────────────────
      updateSettings: (data) => set((s) => ({
        settings: { ...s.settings, ...data }
      })),

      // ── Computed Helpers ───────────────────────────────────────────────────
      getProjectProgress: (projectId) => {
        const { tasks, projects } = get();
        const project = projects.find(p => p.id === projectId);
        if (project?.status === 'Concluído') return 100;
        
        const projectTasks = tasks.filter(t => t.projectId === projectId);
        if (projectTasks.length === 0) return 0;
        const done = projectTasks.filter(t => t.done).length;
        return Math.round((done / projectTasks.length) * 100);
      },

      getWeeklyProductivity: () => {
        const { tasks, pomodoroSessions } = get();
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const result = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const dayName = days[d.getDay()];
          const tarefas = tasks.filter(t => t.done && t.createdAt.startsWith(dateStr)).length;
          const sessions = pomodoroSessions.filter(p => p.date === dateStr);
          const horas = Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60 * 10) / 10;
          result.push({ name: dayName, tarefas, horas });
        }
        return result;
      },

      getTodayTasks: () => {
        const { tasks } = get();
        const todayStr = today();
        return tasks.filter(t => t.date === todayStr && !t.done);
      },

      getUpcomingEvents: () => {
        const { events, tasks, routine } = get();
        
        // Generate an array of date strings for today + next 7 days
        const next7Days = Array.from({ length: 8 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return {
            dateStr: d.toISOString().split('T')[0],
            weekDay: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()] as RoutineDay
          };
        });

        const minDate = next7Days[0].dateStr;
        const maxDate = next7Days[7].dateStr;

        const upcomingEvents = events.filter(e => e.date >= minDate && e.date <= maxDate);
        
        const upcomingTasks = tasks
          .filter(t => !t.done && t.date >= minDate && t.date <= maxDate)
          .map(t => ({
            id: t.id,
            title: t.title,
            subtitle: `Tarefa • ${t.tag}`,
            date: t.date,
            time: '',
            color: '#6366f1',
            createdAt: t.createdAt
          } as CalendarEvent));

        const upcomingRoutines: CalendarEvent[] = [];
        next7Days.forEach(({ dateStr, weekDay }) => {
          routine.forEach(r => {
            if ((r.days.includes(weekDay) || r.days.includes('Todos')) && r.category.toLowerCase().includes('estudo')) {
              upcomingRoutines.push({
                id: `routine-${r.id}-${dateStr}`,
                title: r.title,
                subtitle: `Rotina • ${r.category}`,
                date: dateStr,
                time: r.time,
                color: r.color || '#8b5cf6',
                createdAt: now()
              });
            }
          });
        });

        return [...upcomingEvents, ...upcomingTasks, ...upcomingRoutines]
          .sort((a, b) => `${a.date}${a.time || '23:59'}`.localeCompare(`${b.date}${b.time || '23:59'}`))
          .slice(0, 5);
      },

      // ── Jornada do Conhecimento (Zero Punição, 100% Acumulativo) ───────────
      getKnowledgeJourney: () => {
        const { pomodoroSessions, tasks } = get();
        
        const totalStudyMinutes = pomodoroSessions.reduce((acc, s) => acc + s.duration, 0);
        const totalCompletedTasks = tasks.filter(t => t.done).length;
        
        // 1 min = 1 XP, 1 tarefa = 30 XP (100% cumulativo, nunca diminui)
        const totalXP = totalStudyMinutes + (totalCompletedTasks * 30);
        
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekStartStr = weekStart.toISOString().split('T')[0];
        
        const currentWeekSessions = pomodoroSessions.filter(p => p.date >= weekStartStr);
        const weeklyStudyMinutes = currentWeekSessions.reduce((acc, s) => acc + s.duration, 0);
        const weeklyStudyHours = Math.floor(weeklyStudyMinutes / 60);
        const weeklyStudyRemainingMins = weeklyStudyMinutes % 60;
        
        const weeklyCompletedTasks = tasks.filter(t => t.done && t.createdAt >= weekStartStr).length;

        const STAGES: KnowledgeJourneyStage[] = [
          { level: 1, name: 'Semente da Curiosidade', minXP: 0, maxXP: 180, stageType: 'seed', quote: 'Todo grande saber começa com a coragem e a curiosidade de dar o primeiro passo.' },
          { level: 2, name: 'Broto de Atenção', minXP: 180, maxXP: 600, stageType: 'sprout', quote: 'Suas raízes estão se firmando. Cada momento de foco nutre seu crescimento.' },
          { level: 3, name: 'Muda em Florescimento', minXP: 600, maxXP: 1500, stageType: 'sapling', quote: 'A constância gera clareza. Você está crescendo em perfeita harmonia com seu ritmo.' },
          { level: 4, name: 'Árvore Jovem do Saber', minXP: 1500, maxXP: 3600, stageType: 'tree', quote: 'Ramos firmes e folhas vivas. O conhecimento acumulado é seu e ninguém tira.' },
          { level: 5, name: 'Árvore Frondosa da Sabedoria', minXP: 3600, maxXP: 7200, stageType: 'great-tree', quote: 'Uma copa exuberante que oferece sombra, discernimento e serenidade.' },
          { level: 6, name: 'Carvalho Sagrado da Maestria', minXP: 7200, maxXP: Infinity, stageType: 'ancient-oak', quote: 'Conhecimento profundo e inabalável. Uma jornada luminosa e inspiradora.' },
        ];

        let currentStageIndex = STAGES.findIndex(s => totalXP < s.maxXP);
        if (currentStageIndex === -1) currentStageIndex = STAGES.length - 1;
        const currentStage = STAGES[currentStageIndex];
        const nextStage = STAGES[currentStageIndex + 1] || null;

        const stageSpan = currentStage.maxXP === Infinity ? 5000 : (currentStage.maxXP - currentStage.minXP);
        const progressInStage = currentStage.maxXP === Infinity 
          ? 100 
          : Math.min(100, Math.max(0, Math.round(((totalXP - currentStage.minXP) / stageSpan) * 100)));

        return {
          totalStudyMinutes,
          totalCompletedTasks,
          totalXP,
          currentStage,
          nextStage,
          progressInStage,
          weeklyStudyMinutes,
          weeklyStudyHours,
          weeklyStudyRemainingMins,
          weeklyCompletedTasks,
        };
      },

      checkAndUnlockMilestones: () => {
        const { pomodoroSessions, tasks, userMilestones } = get();
        const totalStudyMinutes = pomodoroSessions.reduce((acc, s) => acc + s.duration, 0);
        const totalTasksDone = tasks.filter(t => t.done).length;
        
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const weeklyMinutes = pomodoroSessions
          .filter(p => p.date >= weekStartStr)
          .reduce((acc, s) => acc + s.duration, 0);

        const definitions = [
          { id: 'first_focus', title: 'Primeiro Broto', description: 'Completou sua primeira sessão de foco no LIFE OS', icon: 'Sprout', pass: totalStudyMinutes >= 1 },
          { id: 'focus_5h', title: 'Raízes Firmes', description: 'Acumulou mais de 5 horas de estudo com dedicação', icon: 'Compass', pass: totalStudyMinutes >= 300 },
          { id: 'focus_20h', title: 'Hábito Florescente', description: 'Conquistou a marca de 20 horas de aprendizado real', icon: 'Award', pass: totalStudyMinutes >= 1200 },
          { id: 'focus_50h', title: 'Mestre da Atenção', description: 'Alcançou 50 horas de dedicação profunda e calma', icon: 'Crown', pass: totalStudyMinutes >= 3000 },
          { id: 'tasks_10', title: 'Passos Firmes', description: 'Concluiu 10 tarefas com serenidade e consistência', icon: 'CheckCircle2', pass: totalTasksDone >= 10 },
          { id: 'tasks_50', title: 'Jardineiro do Conhecimento', description: 'Finalizou 50 tarefas no seu próprio ritmo', icon: 'Sparkles', pass: totalTasksDone >= 50 },
          { id: 'weekly_5h', title: 'Semana Dourada', description: 'Dedicou mais de 5 horas de estudo nesta semana', icon: 'Flame', pass: weeklyMinutes >= 300 },
        ];

        const existingIds = new Set((userMilestones || []).map(m => m.id));
        const newUnlocked: UserMilestone[] = [];

        definitions.forEach(d => {
          if (!existingIds.has(d.id) && d.pass) {
            newUnlocked.push({
              id: d.id,
              title: d.title,
              description: d.description,
              icon: d.icon,
              unlockedAt: today(),
            });
          }
        });

        if (newUnlocked.length > 0) {
          const updated = [...(userMilestones || []), ...newUnlocked];
          set({ userMilestones: updated });
          return updated;
        }

        return userMilestones || [];
      },
    }),
    {
      name: 'planner-ti-life-os-storage',
      storage: createJSONStorage(() => firestoreStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          persistedState.certifications = initialCertifications;
        }
        return persistedState;
      },
    }
  )
);

// Sincronização em Tempo Real (multi-device)
import { onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  if (user) {
    const docRef = doc(db, 'userState', user.uid);
    onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const remoteDataStr = snap.data()['planner-ti-life-os-storage'];
        if (remoteDataStr) {
          try {
            const remoteData = JSON.parse(remoteDataStr);
            const currentState = useStore.getState();
            
            // Comparamos pra não causar loops
            if (JSON.stringify(remoteData.state) !== JSON.stringify(currentState)) {
              useStore.setState(remoteData.state);
            }
          } catch(e) {}
        }
      }
    });
  }
});
