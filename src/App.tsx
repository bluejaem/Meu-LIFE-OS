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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { pomodoroIsRunning, tickPomodoro, settings } = useStore();

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

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-200 font-sans selection:bg-indigo-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 h-full relative z-0 bg-black/10 overflow-hidden">
        <AnimatePresence mode="wait">
          {renderModule()}
        </AnimatePresence>
      </main>
    </div>
  );
}
