import { useState, useRef } from 'react';
import { Play, Pause, Sparkles, Check } from 'lucide-react';
import { VoiceInfo } from '../types/voice';

interface VoiceSelectorProps {
  voices: VoiceInfo[];
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  onSelectSuggestedStyle?: (style: string) => void;
  onPreviewVoice?: (voiceId: string, sampleText: string) => Promise<string | null>;
}

export function VoiceSelector({
  voices,
  selectedVoice,
  onSelectVoice,
  onSelectSuggestedStyle,
  onPreviewVoice
}: VoiceSelectorProps) {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const handleTogglePreview = async (voice: VoiceInfo, e: React.MouseEvent) => {
    e.stopPropagation();

    if (playingVoiceId === voice.id && audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setPlayingVoiceId(null);
      return;
    }

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setPlayingVoiceId(null);
    }

    if (onPreviewVoice) {
      setPreviewLoadingId(voice.id);
      try {
        const audioUri = await onPreviewVoice(voice.id, voice.previewSample);
        if (audioUri) {
          const audio = new Audio(audioUri);
          audioPreviewRef.current = audio;
          audio.onended = () => setPlayingVoiceId(null);
          audio.onerror = () => setPlayingVoiceId(null);
          await audio.play();
          setPlayingVoiceId(voice.id);
        }
      } catch (err) {
        console.error('Failed to preview voice', err);
      } finally {
        setPreviewLoadingId(null);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Select Voice Persona
          </h3>
          <p className="text-xs text-slate-400">
            Powered by Gemini audio synthesis (24kHz native clarity)
          </p>
        </div>
        <span className="text-[11px] font-mono text-indigo-400/90 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
          {voices.length} Voices Available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {voices.map((voice) => {
          const isSelected = selectedVoice === voice.id;
          const isPlayingThis = playingVoiceId === voice.id;
          const isLoadingPreview = previewLoadingId === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => onSelectVoice(voice.id)}
              className={`group relative p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700/80'
              }`}
            >
              {/* Header: avatar + name + preview play */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-md text-white transition-transform group-hover:scale-105"
                    style={{ backgroundColor: voice.color }}
                  >
                    {voice.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-white">
                        {voice.name}
                      </h4>
                      {isSelected && (
                        <span className="p-0.5 rounded-full bg-indigo-500 text-white">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      {voice.gender}
                    </span>
                  </div>
                </div>

                {/* Preview sample button */}
                <button
                  type="button"
                  onClick={(e) => handleTogglePreview(voice, e)}
                  disabled={isLoadingPreview}
                  className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                    isPlayingThis
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                  }`}
                  title="Listen to voice sample"
                >
                  {isLoadingPreview ? (
                    <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  ) : isPlayingThis ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[10px] font-medium hidden sm:inline">
                    {isPlayingThis ? 'Stop' : 'Sample'}
                  </span>
                </button>
              </div>

              {/* Tone & Description */}
              <div className="mb-2.5">
                <p className="text-xs font-semibold text-slate-300 mb-0.5">
                  {voice.tone}
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {voice.description}
                </p>
              </div>

              {/* Quick style tags */}
              {voice.suggestedStyles && voice.suggestedStyles.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                  {voice.suggestedStyles.slice(0, 2).map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVoice(voice.id);
                        if (onSelectSuggestedStyle) onSelectSuggestedStyle(s);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-indigo-600/30 hover:text-indigo-300 text-slate-400 border border-slate-700/60 transition-colors"
                      title="Apply this delivery style"
                    >
                      <Sparkles className="w-2.5 h-2.5 inline mr-1 text-indigo-400" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
