// ─── TAREFAS ───────────────────────────────────────────────────────────────────
export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export type Priority = 'low' | 'medium' | 'high';
export type TaskTag = 'Projeto' | 'Faculdade' | 'Pessoal' | 'Leitura' | 'Trabalho' | 'Saúde' | 'Outro';

export interface Task {
  id: string;
  title: string;
  description?: string;
  tag: TaskTag;
  priority: Priority;
  date: string; // ISO date string
  done: boolean;
  subtasks: Subtask[];
  projectId?: string;
  createdAt: string;
}

// ─── PROJETOS ──────────────────────────────────────────────────────────────────
export type ProjectStatus = 'Planejamento' | 'Em progresso' | 'Pausado' | 'Concluído';

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  color: string;
  createdAt: string;
}

// ─── EVENTOS / CALENDÁRIO ──────────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // HH:MM
  color: string;
  createdAt: string;
}

// ─── METAS ─────────────────────────────────────────────────────────────────────
export type GoalType = 'short' | 'medium' | 'long';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  progress: number; // 0–100
  target: string;   // Ex: "3 horas", "100 páginas"
  deadline?: string;
  createdAt: string;
}

// ─── LIVROS ────────────────────────────────────────────────────────────────────
export type BookStatus = 'Quero ler' | 'Lendo' | 'Concluído' | 'Abandonado';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  currentPage: number;
  totalPages: number;
  startDate?: string;
  finishDate?: string;
  rating?: number; // 1–5
  notes?: string;
  createdAt: string;
}

// ─── CERTIFICAÇÕES ─────────────────────────────────────────────────────────────
export type CertStatus = 'Planejado' | 'Em andamento' | 'Concluído';

export interface Certification {
  id: string;
  title: string;
  platform: string;
  status: CertStatus;
  completedDate?: string;
  expiresDate?: string;
  url?: string;
  createdAt: string;
}

// ─── ROTINA ────────────────────────────────────────────────────────────────────
export type RoutineDay = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom' | 'Todos';

export interface RoutineBlock {
  id: string;
  time: string;       // Ex: "06:00"
  title: string;
  duration: number;   // minutos
  category: string;
  days: RoutineDay[];
  color: string;
}

// ─── DIÁRIO ────────────────────────────────────────────────────────────────────
export type Mood = '😊' | '😐' | '😔' | '🔥' | '😴' | '💪';

export interface DiaryEntry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  content: string;
  mood: Mood;
  createdAt: string;
}

// ─── POMODORO / ESTUDO ─────────────────────────────────────────────────────────
export interface PomodoroSession {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  duration: number; // minutos
  taskId?: string;
  label?: string;
  createdAt: string;
}

// ─── FACULDADES ────────────────────────────────────────────────────────────────
export interface Subject {
  id: string;
  name: string;
  progress: number; // 0–100
  grade?: number;
  notes?: string;
}

export interface College {
  id: string;
  name: string;
  course: string;
  period: string;
  subjects: Subject[];
  createdAt: string;
}

// ─── CONFIGURAÇÕES ─────────────────────────────────────────────────────────────
export interface AppSettings {
  wallpaperUrl: string;
  userName: string;
  avatarUrl?: string;
  accentColor: string;
  language: string;
  notifications: boolean;
}
