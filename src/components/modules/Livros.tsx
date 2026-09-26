import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { Plus, BookOpen, Pencil, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { Book, BookStatus } from '@/types';
import { Modal, ConfirmModal, FormField, inputClass, selectClass, SubmitButton } from '../ui/Modal';
import { ContextMenu } from '../ui/ContextMenu';

const STATUS_CONFIG: Record<BookStatus, { text: string; bg: string; border: string }> = {
  'Quero ler': { text: 'text-slate-400', bg: 'bg-slate-800/80', border: 'border-slate-700/60' },
  'Lendo': { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'Concluído': { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'Abandonado': { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

const EMPTY_FORM = { title: '', author: '', status: 'Quero ler' as BookStatus, currentPage: 0, totalPages: 0, notes: '' };

export function Livros() {
  const { books, addBook, updateBook, deleteBook } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updateBookId, setUpdateBookId] = useState<Book | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'Todos'>('Todos');

  const openCreate = () => { setForm(EMPTY_FORM); setCreateOpen(true); };
  const openEdit = (b: Book) => { setEditBook(b); setForm({ ...b }); };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addBook({ ...form, currentPage: Number(form.currentPage), totalPages: Number(form.totalPages) });
    setCreateOpen(false);
  };
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBook) return;
    updateBook(editBook.id, { ...form, currentPage: Number(form.currentPage), totalPages: Number(form.totalPages) });
    setEditBook(null);
  };

  const filtered = filterStatus === 'Todos' ? books : books.filter(b => b.status === filterStatus);
  const lendo = books.filter(b => b.status === 'Lendo').length;
  const concluidos = books.filter(b => b.status === 'Concluído').length;

  return (
    <PageLayout
      title="Biblioteca"
      subtitle={`${books.length} livros · ${lendo} lendo · ${concluidos} concluídos`}
      actions={
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Adicionar Livro
        </button>
      }
    >
      <div className="flex flex-col gap-6 pb-8">
        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 text-xs font-medium w-fit overflow-x-auto">
          {(['Todos', 'Lendo', 'Quero ler', 'Concluído', 'Abandonado'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "rounded-lg text-xs font-medium px-3 py-1.5 transition-all duration-200 whitespace-nowrap",
                filterStatus === s
                  ? "bg-slate-800/90 text-white shadow-sm border border-slate-700/60"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center py-20 text-center gap-4 shadow-sm">
            <BookOpen size={40} className="text-slate-600" />
            <p className="text-slate-400">Nenhum livro nesta lista.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(book => {
              const cfg = STATUS_CONFIG[book.status];
              const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
              return (
                <div key={book.id} className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 flex flex-col group hover:border-slate-700/80 hover:bg-slate-800/40 transition-all duration-200 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center">
                      <BookOpen size={18} className="text-slate-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full border", cfg.bg, cfg.text, cfg.border)}>
                        {book.status}
                      </span>
                      <ContextMenu
                        items={[
                          { label: 'Editar', icon: <Pencil size={14} />, onClick: () => openEdit(book) },
                          { label: 'Atualizar Leitura', icon: <BookOpen size={14} />, onClick: () => setUpdateBookId(book) },
                          { label: 'Remover', icon: <Trash2 size={14} />, onClick: () => setDeleteId(book.id), danger: true },
                        ]}
                      />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 leading-snug mb-1">{book.title}</h3>
                  <p className="text-xs text-slate-500 mb-4">{book.author}</p>

                  {book.rating && (
                    <div className="flex items-center gap-0.5 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < book.rating! ? "text-amber-400 fill-amber-400" : "text-slate-600"} />
                      ))}
                    </div>
                  )}

                  {book.totalPages > 0 && (
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-xs font-medium mb-2">
                        <span className="text-xs text-slate-500">{book.currentPage} / {book.totalPages} págs</span>
                        <span className="text-xs font-bold text-slate-100">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Adicionar Livro">
        <BookForm form={form} setForm={setForm} onSubmit={handleCreate} label="Adicionar" />
      </Modal>
      <Modal open={!!editBook} onClose={() => setEditBook(null)} title="Editar Livro">
        <BookForm form={form} setForm={setForm} onSubmit={handleEdit} label="Salvar" />
      </Modal>

      {/* Update progress modal */}
      <Modal open={!!updateBookId} onClose={() => setUpdateBookId(null)} title="Atualizar Leitura" size="sm">
        {updateBookId && (
          <div className="flex flex-col gap-4">
            <FormField label="Página atual">
              <input
                type="number" className={inputClass}
                min={0} max={updateBookId.totalPages}
                defaultValue={updateBookId.currentPage}
                onChange={e => setUpdateBookId({ ...updateBookId, currentPage: Number(e.target.value) })}
              />
            </FormField>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setUpdateBookId(null)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={() => {
                updateBook(updateBookId.id, { currentPage: updateBookId.currentPage, status: updateBookId.currentPage >= updateBookId.totalPages ? 'Concluído' : 'Lendo' });
                setUpdateBookId(null);
              }} className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">Salvar</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteBook(deleteId)} title="Remover Livro" confirmLabel="Remover" danger />
    </PageLayout>
  );
}

function BookForm({ form, setForm, onSubmit, label }: any) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label="Título">
        <input className={inputClass} placeholder="Título do livro" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus required />
      </FormField>
      <FormField label="Autor">
        <input className={inputClass} placeholder="Nome do autor" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} required />
      </FormField>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Status">
          <select className={selectClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as BookStatus })}>
            {(['Quero ler', 'Lendo', 'Concluído', 'Abandonado'] as BookStatus[]).map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Pág. atual">
          <input type="number" className={inputClass} min={0} value={form.currentPage} onChange={e => setForm({ ...form, currentPage: e.target.value })} />
        </FormField>
        <FormField label="Total de págs">
          <input type="number" className={inputClass} min={0} value={form.totalPages} onChange={e => setForm({ ...form, totalPages: e.target.value })} />
        </FormField>
      </div>
      <SubmitButton>{label}</SubmitButton>
    </form>
  );
}
