import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Modal, FormField, inputClass, SubmitButton } from '../ui/Modal';
import type { AcademicSubject } from '@/types';

function normalizeInstitution(inst?: string) {
  return inst ? String(inst).trim().toLowerCase() : '';
}

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
  semester: '',
  activeReviewPending: true,
  updatedAt: new Date().toISOString(),
  progress: 0,
  grade: undefined,
  notes: '',
  notebookUrl: '',
  artifacts: {
    notebookUrl: '',
    slidesUrl: '',
    videoScriptUrl: '',
    flashcardsSummary: '',
    infographicUrl: ''
  }
};

export function AcademicSubjectModal({
  open,
  onClose,
  onSave,
  initialData,
  defaultInstitution = ''
}: AcademicSubjectModalProps) {
  const [formData, setFormData] = useState<AcademicSubject>(EMPTY_SUBJECT);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        ...EMPTY_SUBJECT,
        id: crypto.randomUUID(),
        institution: defaultInstitution,
        updatedAt: new Date().toISOString()
      });
    }
  }, [initialData, defaultInstitution, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...formData,
      institution: normalizeInstitution(formData.institution),
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Editar Disciplina' : 'Adicionar Disciplina'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nome da Disciplina" required>
          <input
            type="text"
            className={inputClass}
            placeholder="Ex: Cálculo I, Algoritmos..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Instituição">
            <input
              type="text"
              className={inputClass}
              placeholder="Ex: UFS, UNINTER..."
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
          </FormField>

          <FormField label="Semestre / Período">
            <input
              type="text"
              className={inputClass}
              placeholder="Ex: 2026.1, 1º Semestre"
              value={formData.semester || ''}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Progresso (%)">
            <input
              type="number"
              min="0"
              max="100"
              className={inputClass}
              value={formData.progress || 0}
              onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
            />
          </FormField>

          <FormField label="Média / Nota Final">
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              className={inputClass}
              placeholder="Ex: 8.5"
              value={formData.grade ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  grade: e.target.value === '' ? undefined : Number(e.target.value)
                })
              }
            />
          </FormField>
        </div>

        <FormField label="Link do Caderno de Estudos (NotebookLM ou Docs)">
          <div className="relative">
            <input
              type="url"
              className={inputClass}
              placeholder="https://..."
              value={formData.notebookUrl || ''}
              onChange={(e) => setFormData({ ...formData, notebookUrl: e.target.value })}
            />
            <Sparkles className="w-4 h-4 text-indigo-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </FormField>

        <FormField label="Anotações Gerais">
          <textarea
            className={`${inputClass} min-h-[80px] resize-none`}
            placeholder="Observações importantes, datas de provas..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </FormField>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <SubmitButton>Salvar Disciplina</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}