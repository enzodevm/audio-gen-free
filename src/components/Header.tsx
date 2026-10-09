import { Radio, Sparkles, Mic, Users, Headphones, Zap } from 'lucide-react';

interface HeaderProps {
  activeTab: 'single' | 'dialogue';
  onSelectTab: (tab: 'single' | 'dialogue') => void;
}

export function Header({ activeTab, onSelectTab }: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Gemini Voice Studio
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Free Tier
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transform your words into expressive spoken audio with Gemini
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onSelectTab('single')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'single'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Solo Voice
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('dialogue')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dialogue'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Dual Dialogue
          </button>
        </div>

        {/* Quality Badges */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>gemini-3.8-flash-lite-tts</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <Headphones className="w-3 h-3 text-indigo-400" />
            <span>24kHz WAV</span>
          </div>
        </div>
      </div>
    </header>
  );
}
