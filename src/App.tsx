import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { Tarefas } from '@/components/modules/Tarefas';
import { Projetos } from '@/components/modules/Projetos';
import { Calendario } from '@/components/modules/Calendario';
import { Pomodoro } from '@/components/modules/Pomodoro';
import { Metas } from '@/components/modules/Metas';
import { Livros } from '@/components/modules/Livros';
import { Certificacoes } from '@/components/modules/Certificacoes';
import { Rotina } from '@/components/modules/Rotina';
import { Diario } from '@/components/modules/Diario';
import { Faculdades } from '@/components/modules/Faculdades';
import { Configuracoes } from '@/components/modules/Configuracoes';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

import { Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthScreen } from '@/components/AuthScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pomodoroIsRunning, tickPomodoro, settings } = useStore();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    document.documentElement.style.setProperty('--bg-image', `url('${settings.wallpaperUrl}')`);
  }, [settings.wallpaperUrl]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pomodoroIsRunning) {
      interval = setInterval(() => {
        tickPomodoro();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoroIsRunning, tickPomodoro]);
  

  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard key="dashboard" setActiveTab={setActiveTab} />;
      case 'tarefas': return <Tarefas key="tarefas" />;
      case 'projetos': return <Projetos key="projetos" />;
      case 'calendario': return <Calendario key="calendario" />;
      case 'pomodoro': return <Pomodoro key="pomodoro" />;
      case 'metas': return <Metas key="metas" />;
      case 'livros': return <Livros key="livros" />;
      case 'certificacoes': return <Certificacoes key="certificacoes" />;
      case 'rotina': return <Rotina key="rotina" />;
      case 'diario': return <Diario key="diario" />;
      case 'faculdades': return <Faculdades key="faculdades" />;
      case 'configuracoes': return <Configuracoes key="configuracoes" />;
      default: return <Dashboard key="dashboard" />;
    }
  };

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} 
        isOpen={isSidebarOpen} 
      />
      
      <main className="flex-1 h-full relative z-0 bg-black/10 overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/20 backdrop-blur-lg z-10 flex-shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white">
            <Menu size={20} />
          </button>
          <span className="font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Meu LIFE OS
          </span>
          <div className="w-7" />
        </div>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {renderModule()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
