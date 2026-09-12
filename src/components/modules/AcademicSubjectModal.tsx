import { useState, useEffect } from 'react';
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
  semester: '',
  activeReviewPending: true,
  updatedAt: new Date().toISOString(),
  progress: 0,
  grade: undefined,
  notes: '',
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
      });
    } else {
      setForm({
        ...EMPTY_SUBJECT,
        id: crypto.randomUUID(),
        institution: defaultInstitution || '',
        updatedAt: new Date().toISOString()
      });
    }
  }, [initialData, defaultInstitution, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    onSave({
      ...form,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? "Editar Disciplina" : "Nova Disciplina"} size="lg">
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
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Instituição">
            <input
              className={inputClass}
              placeholder="Ex: USP, Estácio..."
              value={form.institution}
              onChange={e => setForm({ ...form, institution: e.target.value })}
            />
          </FormField>

          <FormField label="Semestre / Período">
            <input
              className={inputClass}
              placeholder="Ex: 2026.2, 3º Semestre..."
              value={form.semester || ''}
              onChange={e => setForm({ ...form, semester: e.target.value })}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
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
