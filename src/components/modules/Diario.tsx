import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { Plus, BookHeart, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { DiaryEntry, Mood } from '@/types';
import { Modal, ConfirmModal, FormField, inputClass, SubmitButton } from '../ui/Modal';

const MOODS: Mood[] = ['😊', '😐', '😔', '🔥', '😴', '💪'];
const MOOD_LABEL: Record<Mood, string> = { '😊': 'Feliz', '😐': 'Neutro', '😔': 'Triste', '🔥': 'Motivado', '😴': 'Cansado', '💪': 'Forte' };

const EMPTY_FORM = { date: new Date().toISOString().split('T')[0], content: '', mood: '😊' as Mood };

export function Diario() {
  const { diary, addDiaryEntry, deleteDiaryEntry } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<DiaryEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    addDiaryEntry(form);
    setCreateOpen(false);
    setForm(EMPTY_FORM);
  };

  const sorted = [...diary].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <PageLayout
      title="Diário"
      subtitle={`${diary.length} ${diary.length === 1 ? 'entrada' : 'entradas'} registradas`}
      actions={
        <button onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Nova Entrada
        </button>
      }
    >
      <div className="flex flex-col gap-4 max-w-3xl pb-8">
        {sorted.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center py-20 text-center gap-4">
            <BookHeart size={40} className="text-slate-600" />
            <p className="text-slate-400">Seu diário está em branco. Registre seu primeiro dia!</p>
          </div>
        ) : (
          sorted.map(entry => (
            <div
              key={entry.id}
              className="glass-panel p-5 cursor-pointer hover:bg-white/5 transition-colors group relative"
              onClick={() => setViewEntry(entry)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{entry.mood}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-xs text-slate-500">{MOOD_LABEL[entry.mood]}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(entry.id); }}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all p-1.5 rounded-lg hover:bg-white/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{entry.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Entrada no Diário" size="lg">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Data">
              <input type="date" className={inputClass} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </FormField>
            <FormField label="Humor">
              <div className="flex items-center gap-2">
                {MOODS.map(m => (
                  <button type="button" key={m} onClick={() => setForm({ ...form, mood: m })}
                    className={cn("text-2xl p-1.5 rounded-xl transition-all", form.mood === m ? "bg-white/20 scale-125" : "opacity-50 hover:opacity-100")}
                  >{m}</button>
                ))}
              </div>
            </FormField>
          </div>
          <FormField label="Como foi seu dia?">
            <textarea
              className={cn(inputClass, "resize-none h-48")}
              placeholder="Escreva sobre seu dia, pensamentos, conquistas..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              autoFocus
              required
            />
          </FormField>
          <SubmitButton>Salvar Entrada</SubmitButton>
        </form>
      </Modal>

      {/* View Modal */}
      {viewEntry && (
        <Modal open={!!viewEntry} onClose={() => setViewEntry(null)} title="" size="lg">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{viewEntry.mood}</span>
              <div>
                <p className="text-lg font-bold text-slate-100">
                  {new Date(viewEntry.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-sm text-slate-400">{MOOD_LABEL[viewEntry.mood]}</p>
              </div>
            </div>
            <div className="w-full h-px bg-white/5" />
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{viewEntry.content}</p>
          </div>
        </Modal>
      )}

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteDiaryEntry(deleteId)} title="Excluir Entrada" description="Esta entrada do diário será removida permanentemente." confirmLabel="Excluir" danger />
    </PageLayout>
  );
}
