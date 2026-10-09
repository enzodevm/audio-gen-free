/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useId } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Wand2, 
  Languages, 
  Trash2, 
  AlertCircle,
  FileText,
  Clock,
  Info
} from 'lucide-react';

import { VOICES, SCRIPT_PRESETS } from './constants/presets.js';
import { Header } from './components/Header.jsx';
import { AudioPlayer } from './components/AudioPlayer.jsx';
import { VoiceSelector } from './components/VoiceSelector.jsx';
import { StyleSelector } from './components/StyleSelector.jsx';
import { DialogueEditor } from './components/DialogueEditor.jsx';
import { HistoryDrawer } from './components/HistoryDrawer.jsx';

const STORAGE_KEY = 'gemini_voice_studio_clips';

export default function App() {
  const [activeTab, setActiveTab] = useState('single');
  const [voices] = useState(VOICES);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash-lite-tts');
  const [style, setStyle] = useState('');
  
  // Script text
  const [text, setText] = useState(
    'Welcome to Gemini Voice Studio. Whatever words you write here, I will speak with natural clarity, human expression, and studio-quality audio.'
  );

  // Dual Dialogue state
  const [speaker1Voice, setSpeaker1Voice] = useState('Puck');
  const [speaker2Voice, setSpeaker2Voice] = useState('Kore');
  const [dialogueTurns, setDialogueTurns] = useState([
    {
      id: '1',
      speaker: 'Alex',
      text: 'Welcome back everyone! <breath> Today we are testing next-generation voice models.',
      style: 'Enthusiastic podcast host'
    },
    {
      id: '2',
      speaker: 'Sam',
      text: "That's right, |yeah| it's amazing how realistic and clear the audio sounds.",
      style: 'Articulate co-host'
    },
    {
      id: '3',
      speaker: 'Alex',
      text: 'Best of all, anyone can type in words and have them spoken freely!',
      style: 'Excited and cheerful'
    }
  ]);

  // Audio generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [currentClip, setCurrentClip] = useState(null);
  const [historyClips, setHistoryClips] = useState([]);
  const [enhancingAction, setEnhancingAction] = useState(null);

  // In-memory cache for preview audio clips
  const previewCache = useRef({});

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistoryClips(parsed);
          if (parsed.length > 0 && !currentClip) {
            setCurrentClip(parsed[0]);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  // Save history to localStorage
  const saveClips = (clips) => {
    setHistoryClips(clips);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clips.slice(0, 30)));
    } catch (e) {
      console.error('Failed to persist history', e);
    }
  };

  // Compute text statistics
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const estimatedSeconds = Math.max(1, Math.round(wordCount / 2.3));

  // Handle Speech Generation
  const handleGenerateSpeech = async () => {
    if (activeTab === 'single' && !text.trim()) {
      setError('Please write some words for the voice to speak.');
      return;
    }

    if (activeTab === 'dialogue' && dialogueTurns.every(t => !t.text.trim())) {
      setError('Please provide at least one spoken line in the dialogue.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let payload;
      if (activeTab === 'single') {
        payload = {
          text: text.trim(),
          voice: selectedVoice,
          style: style.trim(),
          model: selectedModel,
          isDialogue: false
        };
      } else {
        payload = {
          isDialogue: true,
          dialogueTurns: dialogueTurns.filter(t => t.text.trim()),
          speakersConfig: [
            { speaker: 'Alex', voiceName: speaker1Voice },
            { speaker: 'Sam', voiceName: speaker2Voice }
          ]
        };
      }

      const res = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to synthesize voice audio.');
      }

      const newClip = {
        id: Math.random().toString(36).substring(2, 9),
        text: activeTab === 'single' 
          ? text.trim() 
          : dialogueTurns.map(t => `${t.speaker}: ${t.text}`).join(' | '),
        voice: activeTab === 'single' ? selectedVoice : `${speaker1Voice} & ${speaker2Voice}`,
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
        style: activeTab === 'single' ? style : 'Dual Dialogue',
        model: activeTab === 'single' ? selectedModel : 'gemini-3.8-flash-tts',
        createdAt: new Date().toISOString(),
        isDialogue: activeTab === 'dialogue'
      };

      setCurrentClip(newClip);
      saveClips([newClip, ...historyClips]);
    } catch (err) {
      console.error('Speech generation error:', err);
      const msg = err instanceof Error ? err.message : 'Error generating speech audio.';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview voice sample handler
  const handlePreviewVoice = async (voiceId, sampleText) => {
    if (previewCache.current[voiceId]) {
      return previewCache.current[voiceId];
    }

    try {
      const res = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          voice: voiceId,
          style: 'Warm, clear, and friendly voice preview',
          model: 'gemini-3.8-flash-lite-tts'
        })
      });

      const data = await res.json();
      if (data.audioBase64) {
        const uri = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        previewCache.current[voiceId] = uri;
        return uri;
      }
      return null;
    } catch (err) {
      console.error('Preview error', err);
      return null;
    }
  };

  // Enhance / Polish Script with Gemini
  const handleEnhanceScript = async (action, context) => {
    if (!text.trim()) return;
    setEnhancingAction(action);
    setError(null);
    try {
      const res = await fetch('/api/enhance-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text, context })
      });
      const data = await res.json();
      if (data.enhancedText) {
        setText(data.enhancedText);
      }
    } catch (e) {
      console.error('Enhance script error', e);
    } finally {
      setEnhancingAction(null);
    }
  };

  // Apply preset script
  const applyPreset = (preset) => {
    setText(preset.text);
    setSelectedVoice(preset.voice);
    setStyle(preset.style);
    setActiveTab('single');
  };

  const spokenTextareaId = useId();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Header activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="bg-rose-950/80 border border-rose-500/50 rounded-2xl p-4 flex items-start justify-between gap-3 text-rose-200 text-sm shadow-lg animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Generation Notice</p>
                <p className="text-xs text-rose-300 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 text-xs px-2 py-1 rounded bg-rose-900/60"
            >
              Dismiss
            </button>
          </div>
        )}

        <section aria-label="Audio Playback">
          <AudioPlayer clip={currentClip} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Quick Script Presets
                </span>
                <span className="text-[11px] text-slate-500">1-click to test voices</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SCRIPT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 hover:border-indigo-500/50 transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <span>{p.icon}</span>
                    <span>{p.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'single' ? (
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <label htmlFor={spokenTextareaId} className="text-sm font-semibold text-slate-200">
                      Words to Speak
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEnhanceScript('polish')}
                      disabled={enhancingAction !== null || !text.trim()}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 disabled:opacity-40 transition-colors"
                      title="Polish wording for smooth speech cadence"
                    >
                      <Wand2 className="w-3 h-3 text-indigo-400" />
                      {enhancingAction === 'polish' ? 'Polishing...' : 'Polish Delivery'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEnhanceScript('translate', 'Spanish')}
                      disabled={enhancingAction !== null || !text.trim()}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 disabled:opacity-40 transition-colors"
                      title="Translate to Spanish"
                    >
                      <Languages className="w-3 h-3 text-emerald-400" />
                      {enhancingAction === 'translate' ? 'Translating...' : 'Spanish'}
                    </button>

                    {text && (
                      <button
                        type="button"
                        onClick={() => setText('')}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Clear all text"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    id={spokenTextareaId}
                    rows={6}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste any words you want the voice to speak... (e.g. greeting, story, announcement, dialogue)"
                    className="w-full bg-slate-950 border border-slate-800/90 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none transition-all resize-y leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono">{wordCount} words</span>
                    <span>•</span>
                    <span className="font-mono">{charCount} chars</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      Est. ~{estimatedSeconds}s audio
                    </span>
                  </div>

                  <span className="text-[11px] text-indigo-400/80 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Gemini Speech Synthesizer
                  </span>
                </div>
              </div>
            ) : (
              <DialogueEditor
                dialogueTurns={dialogueTurns}
                onChangeTurns={setDialogueTurns}
                voices={voices}
                speaker1Voice={speaker1Voice}
                speaker2Voice={speaker2Voice}
                onChangeSpeaker1Voice={setSpeaker1Voice}
                onChangeSpeaker2Voice={setSpeaker2Voice}
              />
            )}

            {activeTab === 'single' && (
              <StyleSelector
                style={style}
                onChangeStyle={setStyle}
                selectedModel={selectedModel}
                onChangeModel={setSelectedModel}
              />
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateSpeech}
                disabled={isGenerating}
                className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isGenerating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Voice Audio with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 animate-bounce" />
                    <span>Generate Voice Audio (Free)</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-500 mt-2">
                Generates 24kHz studio-quality WAV audio • Free tier powered by Google Gemini
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            {activeTab === 'single' && (
              <VoiceSelector
                voices={voices}
                selectedVoice={selectedVoice}
                onSelectVoice={setSelectedVoice}
                onSelectSuggestedStyle={(suggested) => setStyle(suggested)}
                onPreviewVoice={handlePreviewVoice}
              />
            )}

            <HistoryDrawer
              clips={historyClips}
              onSelectClip={(c) => setCurrentClip(c)}
              onDeleteClip={(id) => saveClips(historyClips.filter((c) => c.id !== id))}
              onClearAll={() => saveClips([])}
              currentClipId={currentClip?.id}
            />

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Info className="w-4 h-4 text-indigo-400" />
                <span>Voice Customization Tips</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                <li><strong className="text-slate-300">Tone & Emotion:</strong> Type descriptions like <em>"Whispering nervously"</em> or <em>"Fast excited radio DJ"</em>.</li>
                <li><strong className="text-slate-300">Punctuation & Pacing:</strong> Commas, ellipses (<code>...</code>), and exclamation marks naturally introduce human breath and pacing.</li>
                <li><strong className="text-slate-300">Vocal Bursts:</strong> Gemini supports expressive cues like <code>&lt;laugh&gt;</code>, <code>&lt;gasp&gt;</code>, or <code>&lt;breath&gt;</code>.</li>
                <li><strong className="text-slate-300">Unlimited Words:</strong> Type any sentence, paragraph, script, or dialogue.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
        <p>Gemini Voice Studio • High Fidelity Speech Generation powered by Google Gemini Audio Models</p>
      </footer>
    </div>
  );
}
