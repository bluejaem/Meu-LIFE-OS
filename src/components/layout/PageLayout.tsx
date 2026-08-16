import { motion } from 'framer-motion';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageLayout({ title, subtitle, children, actions }: PageLayoutProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col h-full w-full px-10 py-8 overflow-y-auto scrollbar-hide gap-8"
    >
      <header className="flex items-end justify-between shrink-0">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[32px] font-bold text-slate-100 tracking-tight leading-none">{title}</h1>
          {subtitle && <p className="text-[14px] text-slate-400 font-medium">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </header>
      
      <div className="flex-1 w-full">
        {children}
      </div>
    </motion.div>
  );
}
