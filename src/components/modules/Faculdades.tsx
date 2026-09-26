import React, { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';
import { useLifeOSStore } from '../../store/useLifeOSStore';
import {
  GraduationCap,
  BookOpen
} from 'lucide-react';

export function Faculdades() {
  const { colleges, subjects } = useLifeOSStore();
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(colleges[0]?.id || '');

  const activeCollege = colleges.find(c => c.id === selectedCollegeId) || colleges[0];
  const collegeSubjects = subjects.filter(s => s.collegeId === activeCollege?.id);

  const completedCount = collegeSubjects.filter(s => s.status === 'completed').length;
  const progressPercent = collegeSubjects.length > 0
    ? Math.round((completedCount / collegeSubjects.length) * 100)
    : 0;

  return (
    <PageLayout
      title="Hub Acadêmico"
      description="Gerenciamento de cursos superiores, matrizes curriculares e evolução acadêmica."
    >
      <div className="space-y-6">
        {/* Seletor de Cursos / Faculdades */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {colleges.map((college) => {
            const isSelected = college.id === activeCollege?.id;
            return (
              <button
                key={college.id}
                onClick={() => setSelectedCollegeId(college.id)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${isSelected
                  ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 text-sm">{college.name}</h3>
                    <p className="text-xs text-slate-400">{college.degree || 'Graduação'}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Semestre atual: {college.currentSemester || 1}º</span>
                  <span className="text-indigo-400 font-medium">{college.period || 'Em andamento'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Informações e Métricas do Curso Selecionado */}
        {activeCollege && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                  {activeCollege.name}
                </span>
                <h2 className="text-xl font-bold text-white">{activeCollege.course}</h2>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs text-slate-400">Progresso Geral</span>
                  <p className="text-2xl font-bold text-white">{progressPercent}%</p>
                </div>
                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Disciplinas */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Disciplinas ({collegeSubjects.length})
                </h3>
              </div>

              {collegeSubjects.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Nenhuma disciplina cadastrada neste curso.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {collegeSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-slate-200">{subject.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            {subject.code && <span>{subject.code}</span>}
                            {subject.credits && <span>{subject.credits} créditos</span>}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${subject.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : subject.status === 'in_progress'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                          {subject.status === 'completed' ? 'Concluída' : subject.status === 'in_progress' ? 'Em Curso' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}