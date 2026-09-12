import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { cn } from '@/lib/utils';
import type { AcademicSubject } from '@/types';
import { useStore } from '@/store/useStore';

interface SubjectDetailsModalProps {
  open: boolean;
  onClose: () => void;
  subject: AcademicSubject | null;
  collegeId?: string;
  onMarkReviewed?: () => void;
  isReviewedToday?: boolean;
}

export function SubjectDetailsModal({
  open,
  onClose,
  subject,
  collegeId,
  onMarkReviewed,
  isReviewedToday
}: SubjectDetailsModalProps) {
  const updateSubject = useStore(state => state.updateSubject);
  
  const [notes, setNotes] = useState(subject?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync notes when subject changes
  useEffect(() => {
    if (subject) {
      setNotes(subject.notes || '');
    }
  }, [subject]);

  const handleSaveNotes = () => {
    if (collegeId && subject?.id) {
      setIsSaving(true);
      updateSubject(collegeId, subject.id, { notes });
      
      // Simula um pequeno delay para feedback visual de save
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  if (!subject) return null;

  return (
    <Modal open={open} onClose={onClose} title="Detalhes da Disciplina" size="lg">
      <div className="flex flex-col gap-5">
        
        {/* Header com Metadados da Matéria */}
        <div className="flex items-start justify-between pb-3 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {subject.institution && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {subject.institution}
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium">Progresso: {subject.progress || 0}%</span>
            </div>
            <h3 className="text-base font-bold text-white leading-snug">{subject.name}</h3>
          </div>
        </div>

        {/* Bloco de Anotações Manuais */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <BookOpen size={14} /> Minhas Anotações
            </h4>
            <button
              onClick={handleSaveNotes}
              disabled={isSaving || notes === subject.notes}
              className="text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : "Salvar Anotações"}
            </button>
          </div>
          
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escreva seus resumos, conceitos e lembretes importantes aqui..."
            className="w-full h-64 px-4 py-3 text-sm bg-slate-900 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none shadow-inner"
          />
        </div>

        {/* Ação de Conclusão / Revisão Ativa */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-2.5 h-2.5 rounded-full",
              isReviewedToday ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
            )} />
            <span className="text-xs text-slate-400">
              {isReviewedToday ? "Revisão do dia concluída!" : "Pendente para revisão hoje"}
            </span>
          </div>

          {onMarkReviewed && (
            <button
              onClick={onMarkReviewed}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-lg",
                isReviewedToday
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              )}
            >
              <CheckCircle2 size={14} />
              {isReviewedToday ? "Revisado Hoje ✓" : "Marcar como Revisado Hoje"}
            </button>
          )}
        </div>

      </div>
    </Modal>
  );
}
