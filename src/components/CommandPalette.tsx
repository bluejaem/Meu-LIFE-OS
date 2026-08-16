import { useState, useEffect } from 'react';
import { 
  Search, FolderKanban, ListTodo, Calendar, X, 
  BookOpen, Timer, Target, CalendarCheck, GraduationCap, Award, Settings2 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { AnimatePresence, motion } from 'framer-motion';

export function CommandPalette({ isOpen, onClose, onNavigate }: { isOpen: boolean, onClose: () => void, onNavigate: (tab: string) => void }) {
  const [query, setQuery] = useState('');
  const { tasks, projects } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen ? onClose() : onNavigate('search'); // Using onNavigate is a hack, actually we should just set a global open state
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  // Limpa o input sempre que a paleta abrir ou fechar
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'tarefas', label: 'Tarefas', icon: ListTodo },
    { id: 'projetos', label: 'Projetos', icon: FolderKanban },
    { id: 'calendario', label: 'Calendário', icon: Calendar },
    { id: 'diario', label: 'Diário', icon: BookOpen },
    { id: 'livros', label: 'Livros', icon: BookOpen },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'metas', label: 'Metas', icon: Target },
    { id: 'rotina', label: 'Rotina', icon: CalendarCheck },
    { id: 'faculdades', label: 'Faculdades', icon: GraduationCap },
    { id: 'certificacoes', label: 'Certificações', icon: Award },
    { id: 'configuracoes', label: 'Configurações', icon: Settings2 },
  ];

  const searchLower = query.toLowerCase();

  const filteredModules = modules.filter(m => m.label.toLowerCase().includes(searchLower));
  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchLower));
  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchLower));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
            <Search size={20} className="text-slate-400 shrink-0" />
            <input
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-500 text-lg"
              placeholder="Pesquise por tarefas, projetos ou módulos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-hide space-y-4">
            {query === '' && (
              <div className="px-3 py-6 text-center text-sm text-slate-500">
                Digite algo para começar a pesquisar.
              </div>
            )}

            {query !== '' && filteredModules.length > 0 && (
              <div>
                <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-2">Módulos</div>
                {filteredModules.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { onNavigate(m.id); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                      <m.icon size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-200">{m.label}</span>
                  </button>
                ))}
              </div>
            )}

            {query !== '' && filteredTasks.length > 0 && (
              <div>
                <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-2">Tarefas</div>
                {filteredTasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { onNavigate('tarefas'); onClose(); }}
                    className="w-full flex flex-col items-start px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-slate-200">{t.title}</span>
                    {t.description && <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">{t.description}</span>}
                  </button>
                ))}
              </div>
            )}

            {query !== '' && filteredProjects.length > 0 && (
              <div>
                <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-2">Projetos</div>
                {filteredProjects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onNavigate('projetos'); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-slate-200">{p.title}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{p.status}</span>
                  </button>
                ))}
              </div>
            )}

            {query !== '' && filteredModules.length === 0 && filteredTasks.length === 0 && filteredProjects.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-slate-500">
                Nenhum resultado encontrado para "{query}".
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-sans">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-sans">↓</kbd>
              <span>Navegar</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-sans">Enter</kbd>
              <span>Selecionar</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-sans">Esc</kbd>
              <span>Fechar</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
