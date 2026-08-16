import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { Plus, Clock, Pencil, Trash2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { RoutineBlock, RoutineDay } from '@/types';
import { Modal, ConfirmModal, FormField, inputClass, selectClass, SubmitButton } from '../ui/Modal';
import { ContextMenu } from '../ui/ContextMenu';

const ALL_DAYS: RoutineDay[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const BLOCK_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

const EMPTY_FORM = { time: '07:00', title: '', duration: 60, category: 'Estudo', days: ['Seg','Ter','Qua','Qui','Sex'] as RoutineDay[], color: '#6366f1' };

export function Rotina() {
  const { routine, addRoutineBlock, updateRoutineBlock, deleteRoutineBlock, clearRoutine } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editBlock, setEditBlock] = useState<RoutineBlock | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [activeDay, setActiveDay] = useState<RoutineDay>('Seg');

  // Import State
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [previewBlocks, setPreviewBlocks] = useState<any[]>([]);

  const todayBlocks = routine.filter(r => r.days.includes(activeDay) || r.days.includes('Todos' as RoutineDay)).sort((a, b) => a.time.localeCompare(b.time));

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setCreateOpen(true); };
  const openEdit = (b: RoutineBlock) => { setEditBlock(b); setForm({ ...b }); };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addRoutineBlock(form);
    setCreateOpen(false);
  };
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBlock) return;
    updateRoutineBlock(editBlock.id, form);
    setEditBlock(null);
  };

  const toggleDay = (day: RoutineDay) => {
    const newDays = form.days.includes(day) ? form.days.filter((d: RoutineDay) => d !== day) : [...form.days, day];
    setForm({ ...form, days: newDays });
  };

  const parseText = (text: string) => {
    setImportText(text);
    const lines = text.split('\n');
    let currentDays: RoutineDay[] = [activeDay];
    const parsed: any[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const upper = trimmed.toUpperCase();
      if (upper.includes('SEGUNDA A SEXTA') || upper.includes('DIAS ÚTEIS')) {
        currentDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
        continue;
      } else if (upper.includes('SÁBADO') || upper.includes('SABADO')) {
        currentDays = ['Sáb'];
        continue;
      } else if (upper.includes('DOMINGO')) {
        currentDays = ['Dom'];
        continue;
      } else if (upper.includes('FIM DE SEMANA') || upper.includes('FINAL DE SEMANA')) {
        currentDays = ['Sáb', 'Dom'];
        continue;
      } else if (upper.includes('TODOS OS DIAS') || upper.includes('DIARIAMENTE')) {
        currentDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        continue;
      } else if (upper.includes('SEGUNDA-FEIRA') || upper === 'SEGUNDA' || upper === 'SEGUNDA:') {
        currentDays = ['Seg'];
        continue;
      } else if (upper.includes('TERÇA-FEIRA') || upper.includes('TERÇA') || upper === 'TERCA' || upper === 'TERCA:') {
        currentDays = ['Ter'];
        continue;
      } else if (upper.includes('QUARTA-FEIRA') || upper.includes('QUARTA') || upper === 'QUARTA:') {
        currentDays = ['Qua'];
        continue;
      } else if (upper.includes('QUINTA-FEIRA') || upper.includes('QUINTA') || upper === 'QUINTA:') {
        currentDays = ['Qui'];
        continue;
      } else if (upper.includes('SEXTA-FEIRA') || upper.includes('SEXTA') || upper === 'SEXTA:' && !upper.includes('SEGUNDA')) {
        currentDays = ['Sex'];
        continue;
      }

      // Match HH:MM potentially followed by another HH:MM, and then any text
      // e.g. "06:20 - Acordar" or "07:00-08:20 Estudo" or "10:00 — 12:00 Reunião"
      const timeMatch = trimmed.match(/^(\d{2}:\d{2})(?:\s*(?:-|–|—|a|ate|até)\s*(\d{2}:\d{2}))?\s*[-–—:\s]*\s*(.+)$/i);
      
      if (timeMatch) {
        const start = timeMatch[1];
        const end = timeMatch[2];
        const title = timeMatch[3].trim();
        
        let duration = 30; // default
        if (end) {
          const [sh, sm] = start.split(':').map(Number);
          const [eh, em] = end.split(':').map(Number);
          duration = (eh * 60 + em) - (sh * 60 + sm);
          if (duration <= 0) duration += 24 * 60; // crossed midnight
        }

        let category = 'Outro';
        const tUpper = title.toUpperCase();
        if (tUpper.includes('ESTUD') || tUpper.includes('AULA') || tUpper.includes('CURSO') || tUpper.includes('LER') || tUpper.includes('LEITURA')) category = 'Estudo';
        else if (tUpper.includes('TRABALHO') || tUpper.includes('REUNIÃO') || tUpper.includes('PROJETO') || tUpper.includes('PROGRAMAR')) category = 'Trabalho';
        else if (tUpper.includes('ACORDAR') || tUpper.includes('DORMIR') || tUpper.includes('SONO') || tUpper.includes('DESCANSAR')) category = 'Sono';
        else if (tUpper.includes('ALMOÇO') || tUpper.includes('CAFÉ') || tUpper.includes('LANCHE') || tUpper.includes('JANTA') || tUpper.includes('COMER')) category = 'Alimentação';
        else if (tUpper.includes('ACADEMIA') || tUpper.includes('TREINO') || tUpper.includes('CORRIDA') || tUpper.includes('EXERCÍCIO') || tUpper.includes('ALONGAMENTO')) category = 'Exercício';
        else if (tUpper.includes('LAZER') || tUpper.includes('JOGO') || tUpper.includes('FILME') || tUpper.includes('SÉRIE') || tUpper.includes('CELULAR')) category = 'Lazer';

        const colorMap: Record<string, string> = {
          'Estudo': '#6366f1',
          'Exercício': '#10b981',
          'Trabalho': '#f59e0b',
          'Alimentação': '#ec4899',
          'Sono': '#8b5cf6',
          'Lazer': '#3b82f6',
          'Outro': '#64748b',
        };

        parsed.push({ time: start, duration, title, category, days: [...currentDays], color: colorMap[category] || '#6366f1' });
      }
    }
    setPreviewBlocks(parsed);
  };

  const handleImport = () => {
    previewBlocks.forEach(b => addRoutineBlock(b));
    setImportOpen(false);
    setImportText('');
    setPreviewBlocks([]);
  };

  return (
    <PageLayout
      title="Rotina"
      subtitle="Organização do seu dia a dia"
      actions={
        <div className="flex items-center gap-3">
          {routine.length > 0 && (
            <button onClick={() => setClearOpen(true)} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border border-red-500/20">
              <Trash2 size={16} /> Limpar Tudo
            </button>
          )}
          <button onClick={() => { setImportText(''); setPreviewBlocks([]); setImportOpen(true); }} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors border border-white/10">
            <Download size={16} /> Importar Texto
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20">
            <Plus size={16} /> Adicionar Atividade
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 pb-8">
        {/* Day Selector */}
        <div className="flex items-center gap-2">
          {ALL_DAYS.map(d => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activeDay === d ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {todayBlocks.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center py-20 text-center gap-4">
            <Clock size={36} className="text-slate-600" />
            <p className="text-slate-400">Nenhuma atividade para {activeDay}.</p>
            <button onClick={openCreate} className="text-indigo-400 text-sm font-semibold hover:text-indigo-300">+ Adicionar atividade</button>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden divide-y divide-white/5">
            {todayBlocks.map(block => (
              <div key={block.id} className="group flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                {/* Time */}
                <div className="flex flex-col items-end w-14 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-200">{block.time}</span>
                  <span className="text-[11px] text-slate-500">{block.duration}min</span>
                </div>

                {/* Color stripe */}
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: block.color }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{block.title}</p>
                  <p className="text-xs text-slate-500">{block.category}</p>
                </div>

                {/* Days chips */}
                <div className="hidden lg:flex items-center gap-1">
                  {block.days.map(d => (
                    <span key={d} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-400">{d}</span>
                  ))}
                </div>

                <ContextMenu
                  items={[
                    { label: 'Editar', icon: <Pencil size={14} />, onClick: () => openEdit(block) },
                    { label: 'Remover', icon: <Trash2 size={14} />, onClick: () => setDeleteId(block.id), danger: true },
                  ]}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Atividade na Rotina">
        <RoutineForm form={form} setForm={setForm} toggleDay={toggleDay} onSubmit={handleCreate} label="Adicionar" />
      </Modal>
      <Modal open={!!editBlock} onClose={() => setEditBlock(null)} title="Editar Atividade">
        <RoutineForm form={form} setForm={setForm} toggleDay={toggleDay} onSubmit={handleEdit} label="Salvar" />
      </Modal>
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteRoutineBlock(deleteId)} title="Remover Atividade" confirmLabel="Remover" danger />
      <ConfirmModal open={clearOpen} onClose={() => setClearOpen(false)} onConfirm={() => { clearRoutine(); setClearOpen(false); }} title="Limpar Rotina" description="Tem certeza que deseja apagar todas as atividades da rotina? Isso não pode ser desfeito." confirmLabel="Apagar Tudo" danger />

      {/* Modal de Importação */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Importar Rotina por Texto" description="Cole sua rotina aqui. Identificaremos horários e dias automaticamente.">
        <div className="flex flex-col gap-4">
          <textarea
            className={cn(inputClass, "h-48 resize-none font-mono text-xs")}
            placeholder="Exemplo:&#10;SEGUNDA A SEXTA:&#10;06:20 - Acordar&#10;07:00-08:20 - Estudo Cálculo&#10;&#10;SÁBADO:&#10;08:00 - Academia"
            value={importText}
            onChange={e => parseText(e.target.value)}
            autoFocus
          />
          
          {previewBlocks.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Pré-visualização ({previewBlocks.length} itens)</h4>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {previewBlocks.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg text-xs">
                    <span className="font-bold text-slate-300 w-10 shrink-0">{b.time}</span>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                    <span className="font-semibold text-white truncate flex-1">{b.title}</span>
                    <div className="flex gap-1 shrink-0">
                      {b.days.slice(0,3).map((d:string) => <span key={d} className="bg-white/10 px-1 rounded text-[10px] text-slate-400">{d}</span>)}
                      {b.days.length > 3 && <span className="text-[10px] text-slate-500">+{b.days.length - 3}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setImportOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200">
              Cancelar
            </button>
            <button 
              onClick={handleImport}
              disabled={previewBlocks.length === 0}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Importar {previewBlocks.length} Atividades
            </button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}

function RoutineForm({ form, setForm, toggleDay, onSubmit, label }: any) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label="Atividade">
        <input className={inputClass} placeholder="Ex: Estudo Cálculo I" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus required />
      </FormField>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Horário">
          <input type="time" className={inputClass} value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
        </FormField>
        <FormField label="Duração (min)">
          <input type="number" className={inputClass} min={5} step={5} value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
        </FormField>
        <FormField label="Categoria">
          <select className={selectClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {['Estudo', 'Exercício', 'Trabalho', 'Lazer', 'Alimentação', 'Sono', 'Outro'].map(c => <option key={c}>{c}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Dias da semana">
        <div className="flex items-center gap-2 flex-wrap">
          {(['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'] as RoutineDay[]).map(d => (
            <button type="button" key={d} onClick={() => toggleDay(d)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors", form.days.includes(d) ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}
            >{d}</button>
          ))}
        </div>
      </FormField>
      <FormField label="Cor">
        <div className="flex items-center gap-3">
          {BLOCK_COLORS.map(c => (
            <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
              className={cn("w-7 h-7 rounded-full transition-all border-2", form.color === c ? "border-white scale-125" : "border-transparent")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </FormField>
      <SubmitButton>{label}</SubmitButton>
    </form>
  );
}
