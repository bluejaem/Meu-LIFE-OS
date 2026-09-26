import { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Presentation, Video, Image as ImageIcon, Brain } from 'lucide-react';
import { Modal, FormField, inputClass, selectClass, SubmitButton } from '../ui/Modal';
import type { AcademicSubject, AiArtifacts } from '@/types';

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
  status: 'in_progress',
  code: '',
  credits: undefined,
  flashcardsCount: 10,
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
  const [showAiSection, setShowAiSection] = useState(true);

  useEffect(() => {
    if (initialData) {
      const art = initialData.artifacts || initialData.aiArtifacts || {};
      const nbUrl = initialData.notebookUrl || art.notebookUrl || '';
      setFormData({
        ...EMPTY_SUBJECT,
        ...initialData,
        institution: initialData.institution ? String(initialData.institution).trim() : defaultInstitution,
        notebookUrl: nbUrl,
        artifacts: {
          notebookUrl: nbUrl,
          slidesUrl: art.slidesUrl || '',
          videoScriptUrl: art.videoScriptUrl || '',
          flashcardsSummary: art.flashcardsSummary || '',
          infographicUrl: art.infographicUrl || ''
        },
        aiArtifacts: {
          notebookUrl: nbUrl,
          slidesUrl: art.slidesUrl || '',
          videoScriptUrl: art.videoScriptUrl || '',
          flashcardsSummary: art.flashcardsSummary || '',
          infographicUrl: art.infographicUrl || ''
        }
      });
    } else {
      setFormData({
        ...EMPTY_SUBJECT,
        id: crypto.randomUUID(),
        institution: defaultInstitution ? String(defaultInstitution).trim() : '',
        updatedAt: new Date().toISOString()
      });
    }
  }, [initialData, defaultInstitution, open]);

  const updateArtifactField = (field: keyof AiArtifacts, value: string) => {
    setFormData((prev) => {
      const updatedArtifacts: AiArtifacts = {
        ...prev.artifacts,
        [field]: value
      };
      return {
        ...prev,
        notebookUrl: field === 'notebookUrl' ? value : prev.notebookUrl,
        artifacts: updatedArtifacts,
        aiArtifacts: updatedArtifacts
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const trimmedInst = formData.institution ? formData.institution.trim() : (defaultInstitution || 'Geral');
    const nbUrl = formData.notebookUrl?.trim() || formData.artifacts?.notebookUrl?.trim() || '';

    // Calcula quantidade de cartões baseado no resumo se preenchido
    const summaryLines = formData.artifacts?.flashcardsSummary
      ? formData.artifacts.flashcardsSummary.split('\n').filter((l) => l.trim().length > 0).length
      : 0;

    const finalArtifacts: AiArtifacts = {
      notebookUrl: nbUrl,
      slidesUrl: formData.artifacts?.slidesUrl?.trim() || '',
      videoScriptUrl: formData.artifacts?.videoScriptUrl?.trim() || '',
      flashcardsSummary: formData.artifacts?.flashcardsSummary || '',
      infographicUrl: formData.artifacts?.infographicUrl?.trim() || ''
    };

    // Ajusta status conforme progresso se aplicável
    let computedStatus = formData.status || 'in_progress';
    if (formData.progress !== undefined) {
      if (formData.progress >= 100) computedStatus = 'completed';
      else if (formData.progress > 0 && computedStatus === 'pending') computedStatus = 'in_progress';
    }

    const finalSubject: AcademicSubject = {
      ...formData,
      name: formData.name.trim(),
      institution: trimmedInst,
      status: computedStatus,
      notebookUrl: nbUrl,
      artifacts: finalArtifacts,
      aiArtifacts: finalArtifacts,
      flashcardsCount: summaryLines > 0 ? summaryLines : (formData.flashcardsCount || 10),
      updatedAt: new Date().toISOString()
    };

    onSave(finalSubject);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Editar Disciplina' : 'Adicionar Disciplina'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto scrollbar-hide pr-1">
        {/* Identificação Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome da Disciplina" required>
            <input
              type="text"
              className={inputClass}
              placeholder="Ex: Cálculo I, Estruturas de Dados..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoFocus
            />
          </FormField>

          <FormField label="Instituição / Faculdade">
            <input
              type="text"
              className={inputClass}
              placeholder="Ex: UFS, UNINTER, USP..."
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
          </FormField>
        </div>

        {/* Semestre, Código e Créditos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField label="Semestre / Período">
            <input
              type="text"
              className={inputClass}
              placeholder="Ex: 2026.1, 1º Semestre"
              value={formData.semester || ''}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            />
          </FormField>

          <FormField label="Código da Disciplina">
            <input
              type="text"
              className={inputClass}
              placeholder="Ex: MAT101, CC202"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </FormField>

          <FormField label="Créditos">
            <input
              type="number"
              min="0"
              className={inputClass}
              placeholder="Ex: 4"
              value={formData.credits ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  credits: e.target.value === '' ? undefined : Number(e.target.value)
                })
              }
            />
          </FormField>
        </div>

        {/* Status, Progresso e Nota */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField label="Status da Disciplina">
            <select
              className={selectClass}
              value={formData.status || 'in_progress'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'completed' | 'in_progress' | 'pending'
                })
              }
            >
              <option value="in_progress">Em Curso</option>
              <option value="completed">Concluída</option>
              <option value="pending">Pendente</option>
            </select>
          </FormField>

          <FormField label="Progresso (%)">
            <input
              type="number"
              min="0"
              max="100"
              className={inputClass}
              value={formData.progress || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  progress: Math.min(100, Math.max(0, Number(e.target.value)))
                })
              }
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

        {/* Seção Artefatos de IA (Gemini Pro & Google AI) */}
        <div className="rounded-2xl p-4 bg-indigo-500/[0.06] border border-indigo-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Ecossistema de IA (Google AI & Gemini Notebooks)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAiSection(!showAiSection)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {showAiSection ? 'Recolher' : 'Expandir'}
            </button>
          </div>

          {showAiSection && (
            <div className="space-y-3 pt-1">
              <FormField label="Link do Gemini Notebook (NotebookLM / Caderno IA)">
                <div className="relative">
                  <input
                    type="url"
                    className={`${inputClass} pl-9`}
                    placeholder="https://notebooklm.google.com/notebook/..."
                    value={formData.notebookUrl || formData.artifacts?.notebookUrl || ''}
                    onChange={(e) => updateArtifactField('notebookUrl', e.target.value)}
                  />
                  <BookOpen className="w-4 h-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField label="Slides de IA">
                  <div className="relative">
                    <input
                      type="url"
                      className={`${inputClass} pl-8 text-xs`}
                      placeholder="https://docs.google.com/..."
                      value={formData.artifacts?.slidesUrl || ''}
                      onChange={(e) => updateArtifactField('slidesUrl', e.target.value)}
                    />
                    <Presentation className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </FormField>

                <FormField label="Roteiro de Vídeo">
                  <div className="relative">
                    <input
                      type="url"
                      className={`${inputClass} pl-8 text-xs`}
                      placeholder="https://docs.google.com/..."
                      value={formData.artifacts?.videoScriptUrl || ''}
                      onChange={(e) => updateArtifactField('videoScriptUrl', e.target.value)}
                    />
                    <Video className="w-3.5 h-3.5 text-rose-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </FormField>

                <FormField label="Infográfico">
                  <div className="relative">
                    <input
                      type="url"
                      className={`${inputClass} pl-8 text-xs`}
                      placeholder="https://canva.com/..."
                      value={formData.artifacts?.infographicUrl || ''}
                      onChange={(e) => updateArtifactField('infographicUrl', e.target.value)}
                    />
                    <ImageIcon className="w-3.5 h-3.5 text-sky-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </FormField>
              </div>

              <FormField label="Conceitos-Chave / Resumo para Flashcards">
                <div className="relative">
                  <textarea
                    className={`${inputClass} min-h-[70px] text-xs font-mono resize-none pl-8`}
                    placeholder="Cole perguntas e respostas ou conceitos gerados pela IA (um por linha)..."
                    value={formData.artifacts?.flashcardsSummary || ''}
                    onChange={(e) => updateArtifactField('flashcardsSummary', e.target.value)}
                  />
                  <Brain className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-3 pointer-events-none" />
                </div>
              </FormField>
            </div>
          )}
        </div>

        {/* Anotações Gerais */}
        <FormField label="Anotações Gerais & Observações">
          <textarea
            className={`${inputClass} min-h-[70px] resize-none`}
            placeholder="Datas de provas, critérios de avaliação, links do AVA..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </FormField>

        {/* Ações */}
        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <SubmitButton>{initialData ? 'Salvar Alterações' : 'Cadastrar Disciplina'}</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}