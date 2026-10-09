import { useState } from 'react';
import { Sliders, Sparkles, X, Wand2 } from 'lucide-react';
import { STYLE_PRESETS } from '../constants/presets';

interface StyleSelectorProps {
  style: string;
  onChangeStyle: (style: string) => void;
  selectedModel: string;
  onChangeModel: (model: string) => void;
}

export function StyleSelector({
  style,
  onChangeStyle,
  selectedModel,
  onChangeModel
}: StyleSelectorProps) {
  const [isOpenCustom, setIsOpenCustom] = useState(false);

  return (
    <div className="space-y-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Voice Emotion & Delivery Tone
          </h3>
        </div>

        {/* Audio Model Selector */}
        <div className="flex items-center gap-1.5 text-xs bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onChangeModel('gemini-3.8-flash-lite-tts')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedModel === 'gemini-3.8-flash-lite-tts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Fast, ultra low latency, crystal clear TTS"
          >
            Flash Lite TTS <span className="text-[10px] opacity-80">(Fast)</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeModel('gemini-3.8-flash-tts')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedModel === 'gemini-3.8-flash-tts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Flagship voice model with expressive nuance"
          >
            Flash TTS <span className="text-[10px] opacity-80">(Studio)</span>
          </button>
        </div>
      </div>

      {/* Preset Delivery Chips */}
      <div className="flex flex-wrap gap-1.5">
        {STYLE_PRESETS.map((preset) => {
          const isActive = style === preset.value;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChangeStyle(isActive ? '' : preset.value)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Custom Style Input */}
      <div className="pt-2">
        <div className="relative">
          <input
            type="text"
            value={style}
            onChange={(e) => onChangeStyle(e.target.value)}
            placeholder="e.g. Enthusiastic sports commentator with breathless excitement, or Whispering, cozy ASMR..."
            className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none transition-colors pr-16"
          />
          {style && (
            <button
              type="button"
              onClick={() => onChangeStyle('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
              title="Clear custom style"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
          <Wand2 className="w-3 h-3 text-indigo-400" />
          Tip: You can prompt any tone, emotion, tempo, or persona in plain English.
        </p>
      </div>
    </div>
  );
}
