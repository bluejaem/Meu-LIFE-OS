import { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }[size];

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Content */}
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 p-px rounded-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-1/2",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-1/2",
            sizeClass,
          )}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: 'rgba(12,14,22,0.95)', backdropFilter: 'blur(40px)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <Dialog.Title className="text-lg font-bold text-slate-100 tracking-tight">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="text-sm text-slate-400">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </Dialog.Close>
            </div>

            {/* Body */}
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmModal({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirmar', danger = false }: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex gap-3 justify-end mt-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
            danger
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ─── Form field helpers ────────────────────────────────────────────────────────
export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all";

export const selectClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all appearance-none cursor-pointer [&>option]:bg-[#0c0e16]";

export function SubmitButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      type="submit"
      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-indigo-600/20 mt-2"
    >
      {children}
    </button>
  );
}
