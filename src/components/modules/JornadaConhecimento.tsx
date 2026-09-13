import { useEffect } from 'react';
import { 
  Sprout, Award, Crown, CheckCircle2, Sparkles, 
  Compass, Flame, Heart, ShieldCheck, TreePine
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { motion } from 'framer-motion';

interface JornadaConhecimentoProps {
  variant?: 'dashboard' | 'compact';
}

export function JornadaConhecimento({ variant = 'dashboard' }: JornadaConhecimentoProps) {
  const { getKnowledgeJourney, checkAndUnlockMilestones, userMilestones } = useStore(useShallow(state => ({
    getKnowledgeJourney: state.getKnowledgeJourney,
    checkAndUnlockMilestones: state.checkAndUnlockMilestones,
    userMilestones: state.userMilestones
  })));
  const journey = getKnowledgeJourney();

  // Ao montar, verifica se novos marcos foram conquistados
  useEffect(() => {
    checkAndUnlockMilestones();
  }, [journey.totalStudyMinutes, journey.totalCompletedTasks, checkAndUnlockMilestones]);

  const { 
    currentStage, nextStage, progressInStage, totalXP, 
    totalStudyMinutes, totalCompletedTasks,
    weeklyStudyHours, weeklyStudyRemainingMins, weeklyCompletedTasks 
  } = journey;

  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Ícone visual representativo do estágio orgânico
  const renderPlantIllustration = (stageType: string) => {
    switch (stageType) {
      case 'seed':
        return (
          <div className="relative w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <div className="w-4 h-4 rounded-full bg-amber-400/80 animate-ping absolute opacity-30" />
            <Sprout size={28} className="rotate-12" />
          </div>
        );
      case 'sprout':
        return (
          <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <div className="w-5 h-5 rounded-full bg-emerald-400/80 animate-ping absolute opacity-30" />
            <Sprout size={30} />
          </div>
        );
      case 'sapling':
        return (
          <div className="relative w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shadow-lg shadow-teal-500/10">
            <TreePine size={30} />
          </div>
        );
      case 'tree':
        return (
          <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-xl shadow-emerald-500/20">
            <TreePine size={32} className="scale-110" />
          </div>
        );
      case 'great-tree':
        return (
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/25 border border-emerald-400/50 flex items-center justify-center text-emerald-200 shadow-xl shadow-emerald-500/30">
            <TreePine size={34} className="scale-125" />
          </div>
        );
      default:
        return (
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-emerald-500/20 to-indigo-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-2xl shadow-amber-500/20">
            <Crown size={34} />
          </div>
        );
    }
  };

  const renderMilestoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sprout': return <Sprout size={13} className="text-emerald-400" />;
      case 'Compass': return <Compass size={13} className="text-blue-400" />;
      case 'Award': return <Award size={13} className="text-amber-400" />;
      case 'Crown': return <Crown size={13} className="text-yellow-400" />;
      case 'CheckCircle2': return <CheckCircle2 size={13} className="text-indigo-400" />;
      case 'Sparkles': return <Sparkles size={13} className="text-purple-400" />;
      case 'Flame': return <Flame size={13} className="text-rose-400" />;
      default: return <Award size={13} className="text-slate-300" />;
    }
  };

  // ─── Versão Compacta (Para o Módulo Pomodoro / Barra de Foco) ─────────────
  if (variant === 'compact') {
    return (
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {renderPlantIllustration(currentStage.stageType)}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  Nível {currentStage.level}
                </span>
                <span className="text-xs font-bold text-white tracking-tight">{currentStage.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{totalStudyHours}h de foco acumuladas</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg">
            {totalXP} XP
          </span>
        </div>

        {/* Barra de Progresso do Nível */}
        <div className="w-full">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-medium">
            <span>Progresso da Árvore</span>
            <span>{progressInStage}% {nextStage ? `(próximo: Nível ${nextStage.level})` : '• Estágio Máximo'}</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-0.5">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressInStage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Marcos da Semana resumidos */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-300">
          <span className="text-slate-400">Marcos da semana:</span>
          <span className="font-semibold text-white">
            {weeklyStudyHours}h{weeklyStudyRemainingMins > 0 ? `${weeklyStudyRemainingMins}m` : ''} foco · {weeklyCompletedTasks} tarefas
          </span>
        </div>
      </div>
    );
  }

  // ─── Versão Completa (Para o Dashboard) ────────────────────────────────────
  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-black/40 via-emerald-950/10 to-indigo-950/20 backdrop-blur-2xl shadow-2xl relative overflow-hidden group shrink-0">
      {/* Luz ambiente orgânica de fundo */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Cabeçalho do Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sprout size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                Jornada do Conhecimento
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full normal-case flex items-center gap-1">
                  <ShieldCheck size={11} /> 100% Cumulativo • Sem penalidades
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sua árvore acadêmica cresce a cada minuto dedicado. Seu progresso nunca expira ou diminui.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="text-xs text-slate-400">Total Acumulado:</span>
              <span className="text-xs font-bold text-white font-mono">{totalXP} XP</span>
            </div>
          </div>
        </div>

        {/* Grid Principal: Árvore & Nível (Esquerda) + Marcos da Semana (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Lado Esquerdo: A Planta/Árvore em Crescimento (7 cols) */}
          <div className="lg:col-span-7 bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-5">
            <div className="flex items-start gap-4">
              {renderPlantIllustration(currentStage.stageType)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                    Nível {currentStage.level}
                  </span>
                  <h4 className="text-base font-bold text-white tracking-tight truncate">
                    {currentStage.name}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{currentStage.quote}"
                </p>
              </div>
            </div>

            {/* Estatísticas de Foco Acumulado */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Tempo Total de Foco</span>
                <span className="text-lg font-bold text-white tracking-tight">{totalStudyHours} horas</span>
                <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">Sempre acumulando</span>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Tarefas Finalizadas</span>
                <span className="text-lg font-bold text-white tracking-tight">{totalCompletedTasks} concluídas</span>
                <span className="text-[10px] text-indigo-400 font-medium block mt-0.5">Cada tarefa soma 30 XP</span>
              </div>
            </div>

            {/* Barra de Progresso Orgânico */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">
                  {nextStage ? `Evolução para Nível ${nextStage.level} (${nextStage.name})` : 'Grau Máximo de Maestria'}
                </span>
                <span className="text-emerald-400 font-bold font-mono">{progressInStage}%</span>
              </div>
              <div className="w-full h-2.5 bg-black/40 border border-white/10 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressInStage}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Lado Direito: Marcos da Semana & Conquistas Desbloqueadas (5 cols) */}
          <div className="lg:col-span-5 bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-400" />
                  Marcos da Semana
                </h4>
                <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                  Semana Atual
                </span>
              </div>

              {/* Destaque comemorativo positivo */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-white/10 mb-3">
                <p className="text-xs sm:text-[13px] text-slate-200 font-medium leading-snug">
                  Você completou <strong className="text-emerald-400 font-bold">{weeklyStudyHours}h{weeklyStudyRemainingMins > 0 ? ` ${weeklyStudyRemainingMins}m` : ''}</strong> de estudo e <strong className="text-indigo-400 font-bold">{weeklyCompletedTasks} tarefas</strong> esta semana!
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block italic">
                  Celebre cada conquista no seu próprio tempo.
                </span>
              </div>

              {/* Pílulas de Conquistas da Semana */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {weeklyStudyHours >= 1 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Imersão Semanal
                  </span>
                )}
                {weeklyCompletedTasks >= 3 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    ⭐ Ritmo Produtivo
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  <Heart size={10} className="text-rose-400" /> Foco Gentil
                </span>
              </div>
            </div>

            {/* Badges de Conquistas Históricas Desbloqueadas */}
            <div className="border-t border-white/5 pt-3">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Conquistas Desbloqueadas ({userMilestones?.length || 0})
              </span>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
                {(userMilestones || []).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Conclua sua primeira sessão para desbloquear o primeiro broto.</p>
                ) : (
                  userMilestones.map(m => (
                    <div 
                      key={m.id} 
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 shrink-0 hover:bg-white/10 transition-colors"
                      title={`${m.title}: ${m.description}`}
                    >
                      {renderMilestoneIcon(m.icon)}
                      <span className="text-[11px] font-medium text-slate-200">{m.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
