import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Modal, FormField, inputClass, SubmitButton } from '../ui/Modal';
import type { AcademicSubject } from '@/types';

interface AcademicSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (subjectData: AcademicSubject) => void;
  initialData?: AcademicSubject | null;
  defaultInstitution?: string;
}

const EMPTY_SUBJECT: AcademicSubject = {
  id: '',
  name: '',
  institution: '',
  progress: 0,
  grade: undefined,
  notes: '',
  notebookUrl: '',
  aiArtifacts: {
    slidesUrl: '',
    videoScriptUrl: '',
    flashcardsSummary: '',
    infographicUrl: ''
  },
  flashcardsCount: 0
};

export function AcademicSubjectModal({
  open,
  onClose,
  onSave,
  initialData,
  defaultInstitution
}: AcademicSubjectModalProps) {
  const [form, setForm] = useState<AcademicSubject>(EMPTY_SUBJECT);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        institution: initialData.institution || defaultInstitution || '',
        aiArtifacts: {
          slidesUrl: initialData.aiArtifacts?.slidesUrl || '',
          videoScriptUrl: initialData.aiArtifacts?.videoScriptUrl || '',
          flashcardsSummary: initialData.aiArtifacts?.flashcardsSummary || '',
          infographicUrl: initialData.aiArtifacts?.infographicUrl || '',
        }
      });
    } else {
      setForm({
        ...EMPTY_SUBJECT,
        id: crypto.randomUUID(),
        institution: defaultInstitution || ''
      });
    }
  }, [initialData, defaultInstitution, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    // Calcula quantidade estimada de cartões baseada em linhas
    const count = form.aiArtifacts?.flashcardsSummary
      ? form.aiArtifacts.flashcardsSummary.split('\n').filter(l => l.trim()).length
      : 0;

    onSave({
      ...form,
      flashcardsCount: count > 0 ? count : form.flashcardsCount
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? "Editar Disciplina & Artefatos IA" : "Nova Disciplina Inteligente"} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto scrollbar-hide pr-1">
        
        {/* Dados Básicos da Disciplina */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Nome da Disciplina">
            <input
              className={inputClass}
              placeholder="Ex: Algoritmos e Estruturas de Dados"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
          </FormField>

          <FormField label="Instituição (ex: UNINTER, ETEP)">
            <div className="relative">
              <input
                className={inputClass}
                placeholder="UNINTER, ETEP, etc."
                value={form.institution || ''}
                onChange={e => setForm({ ...form, institution: e.target.value })}
              />
              <div className="absolute right-2 top-2.5 flex gap-1">
                {['UNINTER', 'ETEP'].map(inst => (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => setForm({ ...form, institution: inst })}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                  >
                    {inst}
                  </button>
                ))}
              </div>
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <FormField label="Progresso (0-100%)">
            <input
              type="number"
              min={0}
              max={100}
              className={inputClass}
              placeholder="0%"
              value={form.progress}
              onChange={e => setForm({ ...form, progress: Math.min(100, Math.max(0, Number(e.target.value))) })}
            />
          </FormField>

          <FormField label="Nota Atual (Opcional)">
            <input
              type="number"
              min={0}
              max={100}
              step="0.1"
              className={inputClass}
              placeholder="Ex: 85.5"
              value={form.grade !== undefined ? form.grade : ''}
              onChange={e => setForm({ ...form, grade: e.target.value ? Number(e.target.value) : undefined })}
            />
          </FormField>

          <FormField label="Cartões de Flashcards">
            <input
              type="number"
              min={0}
              className={inputClass}
              placeholder="Ex: 25"
              value={form.flashcardsCount || ''}
              onChange={e => setForm({ ...form, flashcardsCount: Number(e.target.value) })}
            />
          </FormField>
        </div>

        {/* Seção de Artefatos de IA do Gemini Notebook */}
        <div className="p-4 rounded-2xl bg-indigo-500/[0.07] border border-indigo-500/20 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-400" />
            Ecossistema de IA (Google AI Pro & Gemini Notebook)
          </div>
          <p className="text-xs text-slate-400">
            Adicione os links diretos para seus materiais gerados por IA para acesso imediato a 1 clique.
          </p>

          <FormField label="📓 Link do Gemini Notebook (Caderno Interativo)">
            <div className="relative">
              <input
                type="url"
                className={inputClass}
                placeholder="https://gemini.google.com/..."
                value={form.notebookUrl || ''}
                onChange={e => setForm({ ...form, notebookUrl: e.target.value })}
              />
            </div>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="📑 Link dos Slides">
              <input
                type="url"
                className={inputClass}
                placeholder="https://docs.google.com/presentation/..."
                value={form.aiArtifacts?.slidesUrl || ''}
                onChange={e => setForm({
                  ...form,
                  aiArtifacts: { ...form.aiArtifacts, slidesUrl: e.target.value }
                })}
              />
            </FormField>

            <FormField label="🎬 Roteiro de Vídeo">
              <input
                type="url"
                className={inputClass}
                placeholder="https://docs.google.com/document/..."
                value={form.aiArtifacts?.videoScriptUrl || ''}
                onChange={e => setForm({
                  ...form,
                  aiArtifacts: { ...form.aiArtifacts, videoScriptUrl: e.target.value }
                })}
              />
            </FormField>

            <FormField label="📊 Link do Infográfico">
              <input
                type="url"
                className={inputClass}
                placeholder="https://canva.com/..."
                value={form.aiArtifacts?.infographicUrl || ''}
                onChange={e => setForm({
                  ...form,
                  aiArtifacts: { ...form.aiArtifacts, infographicUrl: e.target.value }
                })}
              />
            </FormField>
          </div>

          <FormField label="🧠 Resumo para Flashcards / Conceitos-Chave da IA">
            <textarea
              className={`${inputClass} resize-none h-24 text-xs font-mono leading-relaxed`}
              placeholder="Cole os conceitos ou perguntas gerados pelo Gemini Notebook (ex: 'O que é busca binária? Divisão e conquista em O(log n)')..."
              value={form.aiArtifacts?.flashcardsSummary || ''}
              onChange={e => setForm({
                ...form,
                aiArtifacts: { ...form.aiArtifacts, flashcardsSummary: e.target.value }
              })}
            />
          </FormField>
        </div>

        <FormField label="Anotações Gerais da Disciplina (Opcional)">
          <textarea
            className={`${inputClass} resize-none h-16 text-xs`}
            placeholder="Horários de aula, links do AVA, datas de provas..."
            value={form.notes || ''}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </FormField>

        <SubmitButton>Salvar Disciplina</SubmitButton>
      </form>
    </Modal>
  );
}
