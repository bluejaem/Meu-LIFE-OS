import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useStore } from '@/store/useStore';

function FormField({ label, children, className }: { label: string, children: React.ReactNode, className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className || ''}`}>
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

export function ModalAddStudy({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addManualStudySession } = useStore();
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const totalMinutes = (h * 60) + m;

    if (totalMinutes > 0) {
      const today = new Date().toISOString().split('T')[0];
      addManualStudySession(totalMinutes, today);
    }
    
    setHours('');
    setMinutes('');
    onClose();
  };

  const inputClass = "w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm";

  return (
    <Modal open={isOpen} onClose={onClose} title="Adicionar Tempo de Estudo" description="Registre horas de estudo realizadas fora do cronômetro." size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex gap-4">
          <FormField label="Horas" className="flex-1">
            <input
              type="number"
              min="0"
              max="24"
              className={inputClass}
              placeholder="Ex: 2"
              value={hours}
              onChange={e => setHours(e.target.value)}
            />
          </FormField>
          <FormField label="Minutos" className="flex-1">
            <input
              type="number"
              min="0"
              max="59"
              className={inputClass}
              placeholder="Ex: 30"
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
            />
          </FormField>
        </div>
        
        <div className="flex items-center gap-3 mt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors">
            Adicionar
          </button>
        </div>
      </form>
    </Modal>
  );
}
