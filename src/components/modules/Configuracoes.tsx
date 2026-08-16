import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { useStore } from '@/store/useStore';
import { User, Image, Bell } from 'lucide-react';
import { FormField, inputClass } from '../ui/Modal';

const WALLPAPERS = [
  { label: 'Biblioteca', url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=3028&auto=format&fit=crop' },
  { label: 'Montanhas', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3540&auto=format&fit=crop' },
  { label: 'Cidade à Noite', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=3344&auto=format&fit=crop' },
  { label: 'Floresta', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=3540&auto=format&fit=crop' },
  { label: 'Oceano', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=3326&auto=format&fit=crop' },
  { label: 'Espaço', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=3327&auto=format&fit=crop' },
];


export function Configuracoes() {
  const { settings, updateSettings } = useStore();
  const [customWallpaper, setCustomWallpaper] = useState(settings.wallpaperUrl);

  const applyWallpaper = (url: string) => {
    updateSettings({ wallpaperUrl: url });
  };

  return (
    <PageLayout title="Configurações" subtitle="Personalize sua experiência">
      <div className="flex flex-col gap-6 max-w-2xl pb-8">

        {/* Profile Section */}
        <div className="glass-panel p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 mb-2">
            <User size={18} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Perfil</h2>
          </div>
          <FormField label="Seu nome">
            <input
              className={inputClass}
              value={settings.userName}
              onChange={e => updateSettings({ userName: e.target.value })}
              placeholder="Seu nome"
            />
          </FormField>
          <p className="text-xs text-slate-500">Seu nome aparece no Dashboard e nos cumprimentos.</p>
        </div>

        {/* Wallpaper Section */}
        <div className="glass-panel p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 mb-2">
            <Image size={18} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Wallpaper</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {WALLPAPERS.map(wp => (
              <button
                key={wp.url}
                onClick={() => setCustomWallpaper(wp.url)}
                className="group relative h-20 rounded-xl overflow-hidden border-2 transition-all"
                style={{ borderColor: customWallpaper === wp.url ? '#6366f1' : 'transparent', backgroundImage: `url('${wp.url}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold text-white">{wp.label}</span>
                {customWallpaper === wp.url && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <FormField label="URL personalizada">
            <div className="flex gap-2">
              <input className={inputClass} placeholder="https://..." value={customWallpaper} onChange={e => setCustomWallpaper(e.target.value)} />
            </div>
          </FormField>
          
          <div className="flex justify-end mt-2">
            <button 
              onClick={() => customWallpaper && applyWallpaper(customWallpaper)} 
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition-colors flex-shrink-0 shadow-lg shadow-indigo-600/20"
            >
              Salvar Plano de Fundo
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-panel p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={18} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Notificações</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Notificações do sistema</p>
              <p className="text-xs text-slate-500 mt-0.5">Alertas de tarefas e eventos</p>
            </div>
            <button
              onClick={() => updateSettings({ notifications: !settings.notifications })}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.notifications ? 'bg-indigo-600' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${settings.notifications ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
