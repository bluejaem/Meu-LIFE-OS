import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { 
  Plus, BookHeart, Trash2, Sparkles, Lightbulb, 
  CheckCircle2, Compass 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { DiaryEntry, Mood, LearningReflection } from '@/types';
import { Modal, ConfirmModal, FormField, inputClass, SubmitButton } from '../ui/Modal';

const MOODS: Mood[] = ['😊', '😐', '😔', '🔥', '😴', '💪'];
const MOOD_LABEL: Record<Mood, string> = { 
  '😊': 'Feliz', 
  '😐': 'Neutro', 
  '😔': 'Triste', 
  '🔥': 'Motivado', 
  '😴': 'Cansado', 
  '💪': 'Forte' 
};

interface DiaryFormData {
  date: string;
  content: string;
  mood: Mood;
  includeReflection: boolean;
  conceptLearned: string;
  whatWentWell: string;
  tryDifferently: string;
}

const EMPTY_FORM: DiaryFormData = {
  date: new Date().toISOString().split('T')[0],
  content: '',
  mood: '😊',
  includeReflection: false,
  conceptLearned: '',
  whatWentWell: '',
  tryDifferently: '',
};

export function Diario() {
  const { diary, addDiaryEntry, deleteDiaryEntry } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<DiaryEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<DiaryFormData>(EMPTY_FORM);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const hasReflectionContent = 
      form.conceptLearned.trim() || 
      form.whatWentWell.trim() || 
      form.tryDifferently.trim();

    if (!form.content.trim() && !hasReflectionContent) return;

    const reflection: LearningReflection | undefined = (form.includeReflection && hasReflectionContent)
      ? {
          conceptLearned: form.conceptLearned.trim() || undefined,
          whatWentWell: form.whatWentWell.trim() || undefined,
          tryDifferently: form.tryDifferently.trim() || undefined,
        }
      : undefined;

    const finalContent = form.content.trim() 
      ? form.content.trim() 
      : (reflection?.conceptLearned ? `Reflexão: ${reflection.conceptLearned}` : 'Reflexão diária registrada.');

    addDiaryEntry({
      date: form.date,
      content: finalContent,
      mood: form.mood,
      reflection,
    });

    setCreateOpen(false);
    setForm(EMPTY_FORM);
  };

  const sorted = [...diary].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <PageLayout
      title="Diário"
      subtitle={`${diary.length} ${diary.length === 1 ? 'entrada' : 'entradas'} registradas`}
      actions={
        <button 
          onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }} 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Nova Entrada
        </button>
      }
    >
      <div className="flex flex-col gap-4 max-w-3xl pb-8">
        {sorted.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center py-20 text-center gap-4 shadow-sm">
            <BookHeart size={40} className="text-slate-600" />
            <p className="text-slate-400">Seu diário está em branco. Registre seu primeiro dia ou reflexão!</p>
          </div>
        ) : (
          sorted.map(entry => (
            <div
              key={entry.id}
              className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 cursor-pointer hover:border-slate-700/80 hover:bg-slate-800/40 transition-all duration-200 group relative shadow-sm"
              onClick={() => setViewEntry(entry)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{entry.mood}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-xs text-slate-500">{MOOD_LABEL[entry.mood]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {entry.reflection && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                      <Sparkles size={11} /> Reflexão de Aprendizado
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(entry.id); }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1.5 rounded-lg hover:bg-white/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Destaque do Conceito Aprendido se houver reflexão */}
              {entry.reflection?.conceptLearned && (
                <div className="mb-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 mb-1">
                    <Lightbulb size={12} className="text-amber-400" />
                    Conceito Mais Interessante
                  </span>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed italic line-clamp-2">
                    "{entry.reflection.conceptLearned}"
                  </p>
                </div>
              )}

              {entry.content && (
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {entry.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Entrada no Diário" size="lg">
        <form onSubmit={handleCreate} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto scrollbar-hide pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Data">
              <input 
                type="date" 
                className={inputClass} 
                value={form.date} 
                onChange={e => setForm({ ...form, date: e.target.value })} 
              />
            </FormField>
            <FormField label="Como está seu humor hoje?">
              <div className="flex items-center gap-2">
                {MOODS.map(m => (
                  <button 
                    type="button" 
                    key={m} 
                    onClick={() => setForm({ ...form, mood: m })}
                    className={cn(
                      "text-2xl p-1.5 rounded-xl transition-all", 
                      form.mood === m ? "bg-white/20 scale-125 shadow-md shadow-white/10" : "opacity-40 hover:opacity-100"
                    )}
                    title={MOOD_LABEL[m]}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          {/* Toggle do Modo Reflexão de Aprendizado */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Modo Reflexão de Aprendizado</span>
                <span className="text-[11px] text-slate-400">Responda a perguntas leves para fixar conhecimento e celebrar progressos</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, includeReflection: !form.includeReflection })}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0",
                form.includeReflection ? "bg-indigo-600" : "bg-white/10"
              )}
            >
              <div 
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300",
                  form.includeReflection ? "translate-x-7" : "translate-x-1"
                )} 
              />
            </button>
          </div>

          {/* Campos do Modo Reflexão */}
          {form.includeReflection && (
            <div className="flex flex-col gap-4 p-4 rounded-2xl bg-black/25 border border-indigo-500/20">
              <FormField label="💡 Qual foi o conceito ou insight mais interessante que você aprendeu hoje?">
                <textarea
                  className={cn(inputClass, "resize-none h-20 text-sm")}
                  placeholder="Ex: Entendi a lógica de closures em JavaScript ou como funciona o cálculo de juros compostos..."
                  value={form.conceptLearned}
                  onChange={e => setForm({ ...form, conceptLearned: e.target.value })}
                  autoFocus
                />
              </FormField>

              <FormField label="✨ O que fluiu bem nos seus estudos ou na sua rotina?">
                <textarea
                  className={cn(inputClass, "resize-none h-18 text-sm")}
                  placeholder="Ex: Consegui focar por 2 blocos de Pomodoro sem checar notificações..."
                  value={form.whatWentWell}
                  onChange={e => setForm({ ...form, whatWentWell: e.target.value })}
                />
              </FormField>

              <FormField label="🌱 O que você gostaria de explorar ou fazer diferente amanhã? (Sem cobrança)">
                <textarea
                  className={cn(inputClass, "resize-none h-18 text-sm")}
                  placeholder="Ex: Começar pelo assunto mais difícil logo pela manhã..."
                  value={form.tryDifferently}
                  onChange={e => setForm({ ...form, tryDifferently: e.target.value })}
                />
              </FormField>
            </div>
          )}

          <FormField label={form.includeReflection ? "Notas e pensamentos adicionais (opcional)" : "Como foi seu dia?"}>
            <textarea
              className={cn(inputClass, "resize-none h-32 text-sm")}
              placeholder="Escreva livremente sobre pensamentos, sentimentos, reflexões do dia..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              required={!form.includeReflection}
            />
          </FormField>

          <SubmitButton>Salvar Entrada</SubmitButton>
        </form>
      </Modal>

      {/* View Modal */}
      {viewEntry && (
        <Modal open={!!viewEntry} onClose={() => setViewEntry(null)} title="Registro do Diário" size="lg">
          <div className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto scrollbar-hide pr-1">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{viewEntry.mood}</span>
                <div>
                  <p className="text-lg font-bold text-slate-100">
                    {new Date(viewEntry.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-slate-400 font-medium">Humor: {MOOD_LABEL[viewEntry.mood]}</p>
                </div>
              </div>
              {viewEntry.reflection && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                  <Sparkles size={13} /> Modo Reflexão Ativo
                </span>
              )}
            </div>

            {/* Blocos de Reflexão de Aprendizado */}
            {viewEntry.reflection && (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Reflexão de Aprendizado
                </h4>
                
                {viewEntry.reflection.conceptLearned && (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <Lightbulb size={13} />
                      Conceito Mais Interessante
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      {viewEntry.reflection.conceptLearned}
                    </p>
                  </div>
                )}

                {viewEntry.reflection.whatWentWell && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 size={13} />
                      O que fluiu bem nos estudos ou rotina?
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      {viewEntry.reflection.whatWentWell}
                    </p>
                  </div>
                )}

                {viewEntry.reflection.tryDifferently && (
                  <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 mb-1.5">
                      <Compass size={13} />
                      Para explorar ou tentar diferente amanhã
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      {viewEntry.reflection.tryDifferently}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Notas e pensamentos livres */}
            {viewEntry.content && (
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Notas & Pensamentos do Dia
                </h4>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {viewEntry.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      <ConfirmModal 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteId && deleteDiaryEntry(deleteId)} 
        title="Excluir Entrada" 
        description="Esta entrada do diário será removida permanentemente." 
        confirmLabel="Excluir" 
        danger 
      />
    </PageLayout>
  );
}

