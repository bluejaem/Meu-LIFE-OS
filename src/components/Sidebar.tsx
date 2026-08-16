import { useState } from 'react';
import { 
  Home, 
  CalendarCheck, 
  Calendar, 
  ListTodo, 
  FolderKanban,
  GraduationCap,
  BookOpen,
  Award,
  Target,
  BookHeart,
  Timer,
  Settings,
  Search,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CommandPalette } from './CommandPalette';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { section: 'Principal' },
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'tarefas', icon: ListTodo, label: 'Tarefas' },
  { id: 'projetos', icon: FolderKanban, label: 'Projetos' },
  { id: 'calendario', icon: Calendar, label: 'Calendário' },
  { section: 'Conhecimento' },
  { id: 'diario', icon: BookHeart, label: 'Diário' },
  { id: 'livros', icon: BookOpen, label: 'Livros' },
  { section: 'Tracking' },
  { id: 'pomodoro', icon: Timer, label: 'Pomodoro' },
  { id: 'metas', icon: Target, label: 'Metas' },
  { id: 'rotina', icon: CalendarCheck, label: 'Rotina' },
  { section: 'Mais' },
  { id: 'faculdades', icon: GraduationCap, label: 'Faculdades' },
  { id: 'certificacoes', icon: Award, label: 'Certificações' },
];

export function Sidebar({ activeTab, setActiveTab, isOpen }: { activeTab: string, setActiveTab: (t: string) => void, isOpen?: boolean }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <aside className={cn(
      "w-[240px] flex-shrink-0 h-full flex flex-col bg-black/20 backdrop-blur-3xl border-r border-white/5 py-5 select-none z-50 shadow-2xl transition-transform duration-300 ease-in-out",
      "fixed md:relative top-0 left-0",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={setActiveTab} />

      {/* Workspace Selector (Linear style) */}
      <div className="px-5 mb-6 flex items-center h-10">
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Meu LIFE OS
        </span>
      </div>

      {/* Quick Search */}
      <div className="px-4 mb-6">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-full h-8 bg-black/40 border border-white/10 rounded-md flex items-center px-2.5 text-slate-400 gap-2 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <Search size={14} />
          <span className="text-xs font-medium">Search...</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="text-[10px] font-sans px-1 rounded bg-white/10 border border-white/10">⌘</kbd>
            <kbd className="text-[10px] font-sans px-1 rounded bg-white/10 border border-white/10">K</kbd>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 space-y-0.5">
        {menuItems.map((item, index) => {
          if (item.section) {
            return (
              <div key={`sec-${index}`} className="px-3 pt-5 pb-1 text-[11px] font-semibold text-slate-500/70 tracking-wide">
                {item.section}
              </div>
            );
          }

          if (!item.icon) return null;
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as string)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors relative group",
                isActive ? "text-slate-100" : "text-slate-400 hover:text-slate-200"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/10 rounded-md border border-white/5"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={16} className={cn("relative z-10", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="relative z-10 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Settings */}
      <div className="px-3 pt-4 pb-2 mt-auto space-y-1">
        <button
          onClick={() => setActiveTab('configuracoes')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
        >
          <Settings size={16} className="text-slate-500" />
          Settings
        </button>
        <button
          onClick={() => useAuthStore.getState().logout()}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} className="text-red-400/70" />
          Sair
        </button>
      </div>

    </aside>
  );
}
