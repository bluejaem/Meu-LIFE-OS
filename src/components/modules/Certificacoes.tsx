import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { Plus, Award, Pencil, Trash2, ExternalLink, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { Certification, CertStatus } from '@/types';
import { Modal, ConfirmModal, FormField, inputClass, selectClass, SubmitButton } from '../ui/Modal';
import { ContextMenu } from '../ui/ContextMenu';

const STATUS_CONFIG: Record<CertStatus, { text: string; bg: string }> = {
  'Planejado': { text: 'text-slate-400', bg: 'bg-slate-500/10' },
  'Em andamento': { text: 'text-blue-400', bg: 'bg-blue-500/10' },
  'Concluído': { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

const EMPTY_FORM = { title: '', platform: '', status: 'Planejado' as CertStatus, completedDate: '', expiresDate: '', url: '' };

export function Certificacoes() {
  const { certifications, addCertification, updateCertification, deleteCertification } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCert, setEditCert] = useState<Certification | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  const openCreate = () => { setForm(EMPTY_FORM); setCreateOpen(true); };
  const openEdit = (c: Certification) => { setEditCert(c); setForm({ ...c }); };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addCertification(form);
    setCreateOpen(false);
  };
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCert) return;
    updateCertification(editCert.id, form);
    setEditCert(null);
  };

  const concluidas = certifications.filter(c => c.status === 'Concluído').length;
  const emAndamento = certifications.filter(c => c.status === 'Em andamento').length;

  return (
    <PageLayout
      title="Certificações"
      subtitle={`${certifications.length} certificações · ${concluidas} concluídas · ${emAndamento} em andamento`}
      actions={
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Adicionar
        </button>
      }
    >
      <div className="flex flex-col gap-4 pb-8">
        {certifications.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center py-20 text-center gap-4">
            <Award size={40} className="text-slate-600" />
            <p className="text-slate-400">Nenhuma certificação registrada ainda.</p>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden divide-y divide-white/5">
            {certifications.map(cert => {
              const cfg = STATUS_CONFIG[cert.status];
              return (
                <div key={cert.id} className="group flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", cert.status === 'Concluído' ? "bg-emerald-500/15" : "bg-white/5 border border-white/10")}>
                      {cert.status === 'Concluído' ? <Check size={16} className="text-emerald-400" /> : <Award size={16} className="text-slate-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200 leading-snug">{cert.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{cert.platform}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={cn("text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full", cfg.bg, cfg.text)}>
                      {cert.status}
                    </span>
                    {cert.completedDate && <span className="text-xs text-slate-500 hidden md:block">{new Date(cert.completedDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
                    {cert.url && (
                      <a href={cert.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-400 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <ContextMenu
                      items={[
                        { label: 'Editar', icon: <Pencil size={14} />, onClick: () => openEdit(cert) },
                        { label: 'Marcar Concluída', icon: <Check size={14} />, onClick: () => updateCertification(cert.id, { status: 'Concluído', completedDate: new Date().toISOString().split('T')[0] }) },
                        { label: 'Remover', icon: <Trash2 size={14} />, onClick: () => setDeleteId(cert.id), danger: true },
                      ]}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Adicionar Certificação">
        <CertForm form={form} setForm={setForm} onSubmit={handleCreate} label="Adicionar" />
      </Modal>
      <Modal open={!!editCert} onClose={() => setEditCert(null)} title="Editar Certificação">
        <CertForm form={form} setForm={setForm} onSubmit={handleEdit} label="Salvar" />
      </Modal>
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteCertification(deleteId)} title="Remover Certificação" confirmLabel="Remover" danger />
    </PageLayout>
  );
}

function CertForm({ form, setForm, onSubmit, label }: any) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label="Nome da Certificação">
        <input className={inputClass} placeholder="AWS Solutions Architect..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Plataforma">
          <input className={inputClass} placeholder="AWS, Coursera, Udemy..." value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} />
        </FormField>
        <FormField label="Status">
          <select className={selectClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as CertStatus })}>
            {(['Planejado', 'Em andamento', 'Concluído'] as CertStatus[]).map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Data de conclusão">
          <input type="date" className={inputClass} value={form.completedDate} onChange={e => setForm({ ...form, completedDate: e.target.value })} />
        </FormField>
        <FormField label="Expira em">
          <input type="date" className={inputClass} value={form.expiresDate} onChange={e => setForm({ ...form, expiresDate: e.target.value })} />
        </FormField>
      </div>
      <FormField label="URL (opcional)">
        <input type="url" className={inputClass} placeholder="https://..." value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
      </FormField>
      <SubmitButton>{label}</SubmitButton>
    </form>
  );
}
