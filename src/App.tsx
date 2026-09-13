import React, { useState, useEffect, useRef, useTransition, useMemo, useCallback } from 'react';
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
import { AcademicHubView } from '@/components/modules/AcademicHubView';
import { Configuracoes } from '@/components/modules/Configuracoes';
import { QuickCaptureModal } from '@/components/modules/QuickCaptureModal';

import { useStore } from '@/store/useStore';
import { useShallow } from 'zustand/react/shallow';

import { Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthScreen } from '@/components/AuthScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [, startTransition] = useTransition();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { pomodoroIsRunning, settings, isTunnelMode, setQuickCaptureOpen } = useStore(
    useShallow((state) => ({
      pomodoroIsRunning: state.pomodoroIsRunning,
      settings: state.settings,
      isTunnelMode: state.isTunnelMode,
      setQuickCaptureOpen: state.setQuickCaptureOpen,
    }))
  );
  const { currentUser, loading } = useAuthStore();

  useEffect(() => {
    document.documentElement.style.setProperty('--bg-image', `url('${settings.wallpaperUrl}')`);
  }, [settings.wallpaperUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickCaptureOpen(!useStore.getState().isQuickCaptureOpen);
      }
      if (e.key === 'Escape') {
        setQuickCaptureOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setQuickCaptureOpen]);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./workers/pomodoroWorker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'TICK') {
        useStore.getState().updatePomodoroTime(payload.secondsLeft);
      } else if (type === 'FINISHED') {
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
        
        useStore.getState().finishPomodoro();
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (pomodoroIsRunning) {
      workerRef.current?.postMessage({ 
        type: 'START', 
        payload: { secondsLeft: useStore.getState().pomodoroSecondsLeft } 
      });
    } else {
      workerRef.current?.postMessage({ type: 'PAUSE' });
    }
  }, [pomodoroIsRunning]);


  const handleTabChange = useCallback((tab: string) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  }, []);

  const MODULES = useMemo(() => [
    { id: 'dashboard', component: <Dashboard setActiveTab={handleTabChange} /> },
    { id: 'tarefas', component: <Tarefas /> },
    { id: 'projetos', component: <Projetos /> },
    { id: 'calendario', component: <Calendario /> },
    { id: 'pomodoro', component: <Pomodoro /> },
    { id: 'metas', component: <Metas /> },
    { id: 'livros', component: <Livros /> },
    { id: 'certificacoes', component: <Certificacoes /> },
    { id: 'rotina', component: <Rotina /> },
    { id: 'diario', component: <Diario /> },
    { id: 'academic-hub', component: <AcademicHubView /> },
    { id: 'faculdades', component: <AcademicHubView /> },
    { id: 'configuracoes', component: <Configuracoes /> },
  ], [handleTabChange]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Mobile Overlay */}
      {isSidebarOpen && !isTunnelMode && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {!isTunnelMode && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(t) => {
            setIsSidebarOpen(false);
            handleTabChange(t);
          }} 
          isOpen={isSidebarOpen} 
        />
      )}
      
      <main className="flex-1 h-full relative z-0 bg-black/10 overflow-hidden flex flex-col">
        {/* Mobile Header */}
        {!isTunnelMode && (
          <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/20 backdrop-blur-lg z-10 flex-shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white">
              <Menu size={20} />
            </button>
            <span className="font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Meu LIFE OS
            </span>
            <div className="w-7" />
          </div>
        )}

        <div className="flex-1 overflow-hidden relative">
          {MODULES.map(module => (
            <KeepAliveTab key={module.id} isActive={activeTab === module.id}>
              {module.component}
            </KeepAliveTab>
          ))}
        </div>
      </main>

      {/* Cmd+K Modal */}
      <QuickCaptureModal />
    </div>
  );
}

// Helper to keep tabs mounted in the DOM to avoid re-render cost
const KeepAliveTab = React.memo(function KeepAliveTab({ isActive, children }: { isActive: boolean, children: React.ReactNode }) {
  return (
    <div
      className={isActive ? "absolute inset-0 z-10 block" : "absolute inset-0 -z-10 hidden"}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
});
