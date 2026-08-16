import { PageLayout } from '../layout/PageLayout';
import { Construction } from 'lucide-react';

export function GenericModule({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <PageLayout title={title} subtitle={subtitle}>
      <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center gap-6 opacity-60">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
          <Construction size={32} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-light text-slate-200 tracking-tight">Arquitetura em Andamento</h2>
        <p className="text-sm text-slate-400">
          O módulo <strong className="text-white">{title}</strong> está sendo reescrito para o novo motor Liquid Glass. 
          As funcionalidades estarão disponíveis em breve com o novo Design System.
        </p>
      </div>
    </PageLayout>
  );
}
