import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

interface FlashcardInlineProps {
  frente: string;
  verso: string;
}

export function FlashcardInline({ frente, verso }: FlashcardInlineProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="inline-flex relative my-1 mx-1 align-middle cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: '1000px', minWidth: '120px' }}
      title="Clique para virar o flashcard"
    >
      <motion.div
        className="w-full relative"
        animate={{ rotateX: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Frente */}
        <div 
          className={cn(
            "w-full px-3 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 text-center min-h-[36px]",
            "bg-indigo-500/15 border-indigo-500/30 text-indigo-300 group-hover:bg-indigo-500/25 transition-colors shadow-sm"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <HelpCircle size={14} className="text-indigo-400 opacity-70" />
          <span className="text-xs font-bold leading-tight">{frente}</span>
        </div>

        {/* Verso */}
        <div 
          className={cn(
            "w-full absolute inset-0 px-3 py-1.5 rounded-lg border flex items-center justify-center text-center min-h-[36px]",
            "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-sm"
          )}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
        >
          <span className="text-xs font-bold leading-tight">{verso}</span>
        </div>
      </motion.div>
    </div>
  );
}
