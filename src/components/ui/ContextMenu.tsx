import { useState, useRef, useEffect, ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  items: MenuItem[];
  className?: string;
}

export function ContextMenu({ items, className }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-8 z-50 min-w-[160px] rounded-xl overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(15,17,26,0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors text-left",
                item.danger
                  ? "text-rose-400 hover:bg-rose-500/10"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.icon && <span className="opacity-70">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
