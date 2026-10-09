import { useState } from 'react';
import { Plus, Trash2, Users, Sparkles, MessageSquare } from 'lucide-react';
import { DialogueTurn, VoiceInfo } from '../types/voice';

interface DialogueEditorProps {
  dialogueTurns: DialogueTurn[];
  onChangeTurns: (turns: DialogueTurn[]) => void;
  voices: VoiceInfo[];
  speaker1Voice: string;
  speaker2Voice: string;
  onChangeSpeaker1Voice: (v: string) => void;
  onChangeSpeaker2Voice: (v: string) => void;
}

export function DialogueEditor({
  dialogueTurns,
  onChangeTurns,
  voices,
  speaker1Voice,
  speaker2Voice,
  onChangeSpeaker1Voice,
  onChangeSpeaker2Voice
}: DialogueEditorProps) {
  const [speaker1Name, setSpeaker1Name] = useState('Alex');
  const [speaker2Name, setSpeaker2Name] = useState('Sam');

  const addLine = (speaker: string) => {
    const newTurn: DialogueTurn = {
      id: Math.random().toString(36).substring(7),
      speaker,
      text: '',
      style: ''
    };
    onChangeTurns([...dialogueTurns, newTurn]);
  };

  const updateLine = (id: string, updates: Partial<DialogueTurn>) => {
    onChangeTurns(
      dialogueTurns.map((turn) => (turn.id === id ? { ...turn, ...updates } : turn))
    );
  };

  const removeLine = (id: string) => {
    if (dialogueTurns.length <= 1) return;
    onChangeTurns(dialogueTurns.filter((turn) => turn.id !== id));
  };

  const loadPresetDialogue = (type: 'podcast' | 'interview') => {
    if (type === 'podcast') {
      setSpeaker1Name('Alex');
      setSpeaker2Name('Sam');
      onChangeSpeaker1Voice('Puck');
      onChangeSpeaker2Voice('Kore');
      onChangeTurns([
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
    } else {
      setSpeaker1Name('Elena');
      setSpeaker2Name('Marcus');
      onChangeSpeaker1Voice('Aoede');
      onChangeSpeaker2Voice('Fenrir');
      onChangeTurns([
        {
          id: '1',
          speaker: 'Elena',
          text: 'Did you hear the signal from the mountain pass?',
          style: 'Mysterious, hushed whisper'
        },
        {
          id: '2',
          speaker: 'Marcus',
          text: 'Yes. It was not human. We need to leave before the sun sets.',
          style: 'Deep, serious warrior'
        }
      ]);
    }
  };

  return (
    <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
      {/* Dialogue Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Dual-Speaker Dialogue Mode
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadPresetDialogue('podcast')}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80"
          >
            Load Podcast Demo
          </button>
          <button
            type="button"
            onClick={() => loadPresetDialogue('interview')}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80"
          >
            Load Story Demo
          </button>
        </div>
      </div>

      {/* Speaker Voices Configuration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-400">Speaker 1</span>
            <input
              type="text"
              value={speaker1Name}
              onChange={(e) => setSpeaker1Name(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-200 w-24 text-right"
              placeholder="Name"
            />
          </div>
          <select
            value={speaker1Voice}
            onChange={(e) => onChangeSpeaker1Voice(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.tone})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400">Speaker 2</span>
            <input
              type="text"
              value={speaker2Name}
              onChange={(e) => setSpeaker2Name(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-200 w-24 text-right"
              placeholder="Name"
            />
          </div>
          <select
            value={speaker2Voice}
            onChange={(e) => onChangeSpeaker2Voice(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.tone})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dialogue Lines */}
      <div className="space-y-2.5">
        {dialogueTurns.map((turn, index) => {
          const isSpeaker1 = turn.speaker === speaker1Name;
          return (
            <div
              key={turn.id}
              className={`p-3 rounded-xl border transition-all ${
                isSpeaker1
                  ? 'bg-slate-950/80 border-indigo-500/30'
                  : 'bg-slate-950/80 border-purple-500/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <select
                    value={turn.speaker}
                    onChange={(e) => updateLine(turn.id, { speaker: e.target.value })}
                    className="text-xs font-semibold bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
                  >
                    <option value={speaker1Name}>{speaker1Name}</option>
                    <option value={speaker2Name}>{speaker2Name}</option>
                  </select>
                  <input
                    type="text"
                    value={turn.style || ''}
                    onChange={(e) => updateLine(turn.id, { style: e.target.value })}
                    placeholder="Emotion or style (e.g. Laughing, Whisper)"
                    className="text-xs bg-slate-900/60 border border-slate-800 rounded px-2 py-0.5 text-slate-400 placeholder-slate-600 w-44"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeLine(turn.id)}
                  disabled={dialogueTurns.length <= 1}
                  className="text-slate-500 hover:text-rose-400 p-1 disabled:opacity-30 transition-colors"
                  title="Delete line"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                value={turn.text}
                onChange={(e) => updateLine(turn.id, { text: e.target.value })}
                rows={2}
                placeholder={`What should ${turn.speaker} say?`}
                className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
              />
            </div>
          );
        })}
      </div>

      {/* Add Line Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => addLine(speaker1Name)}
          className="flex-1 text-xs py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-indigo-500/20 flex items-center justify-center gap-1.5 font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Line for {speaker1Name}
        </button>
        <button
          type="button"
          onClick={() => addLine(speaker2Name)}
          className="flex-1 text-xs py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-purple-300 border border-purple-500/20 flex items-center justify-center gap-1.5 font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Line for {speaker2Name}
        </button>
      </div>
    </div>
  );
}
