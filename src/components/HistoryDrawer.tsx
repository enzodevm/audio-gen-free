import { useState } from 'react';
import { History, Play, Trash2, Download, Search, X, Volume2 } from 'lucide-react';
import { GeneratedClip } from '../types/voice';

interface HistoryDrawerProps {
  clips: GeneratedClip[];
  onSelectClip: (clip: GeneratedClip) => void;
  onDeleteClip: (id: string) => void;
  onClearAll: () => void;
  currentClipId?: string;
}

export function HistoryDrawer({
  clips,
  onSelectClip,
  onDeleteClip,
  onClearAll,
  currentClipId
}: HistoryDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClips = clips.filter((c) =>
    c.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.voice.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.style && c.style.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const downloadClip = (clip: GeneratedClip, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = `data:${clip.mimeType || 'audio/wav'};base64,${clip.audioBase64}`;
    const cleanName = (clip.text.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_') || 'clip') + '.wav';
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Generation History
          </h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
            {clips.length}
          </span>
        </div>

        {clips.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search Bar */}
      {clips.length > 3 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clips by words or voice..."
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* List */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {filteredClips.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            {clips.length === 0 ? 'No generated voices yet. Create your first one!' : 'No matching clips found.'}
          </div>
        ) : (
          filteredClips.map((clip) => {
            const isCurrent = currentClipId === clip.id;
            return (
              <div
                key={clip.id}
                onClick={() => onSelectClip(clip)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-slate-800/90 border-indigo-500/60 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {clip.voice}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {formatTimestamp(clip.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => downloadClip(clip, e)}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      title="Download audio"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClip(clip.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  "{clip.text}"
                </p>

                {clip.style && (
                  <p className="text-[10px] text-slate-400 italic mt-1 truncate">
                    Style: {clip.style}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
