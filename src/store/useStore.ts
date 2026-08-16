import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { startOfWeek } from 'date-fns';
import type {
  Task, Project, CalendarEvent, Goal, Book,
  Certification, RoutineBlock, DiaryEntry, PomodoroSession,
  College, AppSettings
} from '@/types';

// ─── Utility ──────────────────────────────────────────────────────────────────
const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().split('T')[0];

const initialCertifications: Certification[] = [
  { id: uid(), title: 'CS50: Introduction to Computer Science', platform: 'Harvard University', status: 'Concluído', completedDate: '2025-01-01', createdAt: now() },
  { id: uid(), title: 'Espanhol Básico', platform: 'Instituto Dom Fernando Gomes', status: 'Concluído', completedDate: '2018-01-01', createdAt: now() },
  { id: uid(), title: 'Linguagem de Programação Python Básico', platform: 'Fundação Bradesco', status: 'Concluído', completedDate: '2025-01-01', createdAt: now() },
  { id: uid(), title: 'HTML, CSS e JavaScript', platform: 'Fundação Bradesco', status: 'Concluído', completedDate: '2025-01-01', createdAt: now() },
  { id: uid(), title: 'NEW UBEST - BASIC', platform: 'UNINTER', status: 'Concluído', completedDate: '2026-01-01', createdAt: now() },
  { id: uid(), title: 'NEW UBEST - INTERMEDIATE', platform: 'UNINTER', status: 'Concluído', completedDate: '2026-01-01', createdAt: now() },
  { id: uid(), title: 'Qualificação Profissional para Call Center', platform: 'Desenvolve Já', status: 'Concluído', completedDate: '2025-01-01', createdAt: now() },
  { id: uid(), title: 'Semifinalista ONHB', platform: 'Olimpíada Nacional de História do Brasil', status: 'Concluído', completedDate: '2024-01-01', createdAt: now() },
];

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
      colleges: [],
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
      pomodoroMode: 'focus',
      pomodoroSecondsLeft: 25 * 60,
      pomodoroIsRunning: false,
      pomodoroSelectedTask: null,
      pomodoroDurations: { focus: 25, shortBreak: 5, longBreak: 15 },
      
      setPomodoroState: (state) => set((s) => ({ ...s, ...state })),
      setPomodoroDurations: (durations) => set((s) => ({
        pomodoroDurations: { ...s.pomodoroDurations, ...durations }
      })),
      
      tickPomodoro: () => set((s) => {
        if (!s.pomodoroIsRunning || s.pomodoroSecondsLeft <= 0) return s;
        const newSeconds = s.pomodoroSecondsLeft - 1;
        if (newSeconds === 0) {
          if (s.pomodoroMode === 'focus') {
            const task = s.tasks.find(t => t.id === s.pomodoroSelectedTask);
            const newSession = {
              id: uid(),
              date: today(),
              duration: s.pomodoroDurations.focus, // Usa o tempo configurado em vez de 25 fixo
              taskId: s.pomodoroSelectedTask || undefined,
              label: task ? task.title : 'Sessão livre',
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

      // ── Colleges ───────────────────────────────────────────────────────────
      addCollege: (data) => set((s) => ({
        colleges: [...s.colleges, { ...data, id: uid(), createdAt: now() }]
      })),
      updateCollege: (id, data) => set((s) => ({
        colleges: s.colleges.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      deleteCollege: (id) => set((s) => ({
        colleges: s.colleges.filter(c => c.id !== id)
      })),

      // ── Settings ───────────────────────────────────────────────────────────
      updateSettings: (data) => set((s) => ({
        settings: { ...s.settings, ...data }
      })),

      // ── Computed Helpers ───────────────────────────────────────────────────
      getProjectProgress: (projectId) => {
        const { tasks } = get();
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
        const { events, tasks } = get();
        const todayStr = today();
        
        const upcomingEvents = events.filter(e => e.date >= todayStr);
        
        // Incluir tarefas futuras (já que as de hoje aparecem em "Tarefas de Hoje")
        const upcomingTasks = tasks
          .filter(t => !t.done && t.date > todayStr)
          .map(t => ({
            id: t.id,
            title: t.title,
            subtitle: `Tarefa • ${t.tag}`,
            date: t.date,
            time: '',
            color: '#6366f1', // índigo
            createdAt: t.createdAt
          } as CalendarEvent));

        return [...upcomingEvents, ...upcomingTasks]
          .sort((a, b) => `${a.date}${a.time || '23:59'}`.localeCompare(`${b.date}${b.time || '23:59'}`))
          .slice(0, 5);
      },
    }),
    {
      name: 'planner-ti-life-os-storage',
      storage: createJSONStorage(() => localStorage),
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
