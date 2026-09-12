import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Sparkles, X } from 'lucide-react';

export function QuickCaptureModal() {
  const { isQuickCaptureOpen, setQuickCaptureOpen, addTask } = useStore();
  const [taskTitle, setTaskTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isQuickCaptureOpen) {
      // Focus after a short delay to allow animation to complete
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setTaskTitle('');
    }
  }, [isQuickCaptureOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    
    addTask({
      title: taskTitle.trim(),
      tag: 'Outro',
      priority: 'medium',
      done: false,
      date: todayStr,
      subtasks: []
    });

    setTaskTitle('');
    setQuickCaptureOpen(false);
  };

  const closeModal = () => setQuickCaptureOpen(false);

  return (
    <AnimatePresence>
      {isQuickCaptureOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-lg mx-4 pointer-events-auto"
            >
              <form 
                onSubmit={handleSubmit}
                className="relative bg-black/60 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden"
              >
                <div className="flex items-center px-4 py-3 border-b border-white/10">
                  <Sparkles className="w-5 h-5 text-indigo-400 mr-3" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="O que está em sua mente? (Pressione Enter)"
                    className="flex-1 bg-transparent border-none outline-none text-white/90 placeholder:text-white/40 text-lg"
                  />
                  <button
                    type="button"
                    onClick={closeModal}
                    className="p-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-4 py-2 bg-black/20 flex justify-between items-center text-xs text-white/40">
                  <span>Criando em: <strong>Hoje</strong> • <strong>Geral</strong></span>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-[10px]">Enter</kbd>
                    <span>salvar</span>
                    <kbd className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-[10px] ml-2">Esc</kbd>
                    <span>fechar</span>
                  </span>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
