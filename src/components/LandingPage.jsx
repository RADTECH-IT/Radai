import React from 'react';
import { MODES } from '../constants';
import * as Icons from 'lucide-react';

const LandingPage = ({ onGetStarted, theme, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative overflow-hidden transition-colors duration-300">
      
      {/* Subtle background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-accent-rose/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      {/* Top Nav */}
      <nav className="relative z-20 w-full px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Icons.Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">RadAI</span>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-outline text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
        </button>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-12 pb-16">
        <div className="text-center mb-16 animate-slide-up max-w-3xl">

          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Asisten Belajar
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Radiologi</span>
          </h1>
          
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
            Tutor AI cerdas untuk Radiografer. 
            Belajar lebih mudah dengan penjelasan mendalam, kuis interaktif, dan studi kasus klinis.
          </p>
          
          <button 
            onClick={onGetStarted}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            Mulai Belajar
            <Icons.ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full max-w-5xl">
          {MODES.map((mode, idx) => {
            const Icon = Icons[mode.icon];
            const descriptions = {
              explain: 'Penjelasan mendalam tentang anatomi, fisika radiasi, dan teknik pencitraan.',
              quiz: 'Kuis pilihan ganda sesuai standar UKOM untuk menguji pemahaman.',
              summary: 'Ringkasan materi yang padat dan mudah dipahami untuk review cepat.',
              case: 'Studi kasus klinis untuk melatih kemampuan analisis radiografer.',
            };
            const colors = {
              explain: 'text-sky-500',
              quiz: 'text-emerald-500',
              summary: 'text-violet-500',
              case: 'text-amber-500',
            };
            const bgColors = {
              explain: 'bg-sky-500/10 border-sky-500/20',
              quiz: 'bg-emerald-500/10 border-emerald-500/20',
              summary: 'bg-violet-500/10 border-violet-500/20',
              case: 'bg-amber-500/10 border-amber-500/20',
            };
            return (
              <div 
                key={mode.id}
                className="glass-panel rounded-2xl p-6 bg-white/40 dark:bg-transparent hover:border-primary/30 hover:shadow-md transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className={`w-11 h-11 rounded-xl ${bgColors[mode.id]} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className={colors[mode.id]} />
                </div>
                <h3 className="text-base font-bold mb-2">{mode.label}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {descriptions[mode.id]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center">
          <p className="text-xs text-on-surface-variant/50">
            @2026-Created by Oneris System
          </p>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
