import { useState, useRef, useEffect, useId } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Download, 
  Check, 
  Copy, 
  Repeat, 
  Sparkles,
  Music
} from 'lucide-react';

export function AudioPlayer({ clip }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [copied, setCopied] = useState(false);

  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Re-initialize when clip changes
  useEffect(() => {
    if (!clip?.audioBase64) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(`data:${clip.mimeType || 'audio/wav'};base64,${clip.audioBase64}`);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    audio.onended = () => {
      if (!isLooping) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.playbackRate = playbackRate;
    audio.volume = isMuted ? 0 : volume;
    audio.loop = isLooping;

    // Auto-play the newly generated clip
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [clip?.id, clip?.audioBase64]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Playback error:', err);
      });
    }
  };

  const skipSeconds = (seconds) => {
    if (!audioRef.current) return;
    const nextTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleDownload = () => {
    if (!clip?.audioBase64) return;
    const link = document.createElement('a');
    link.href = `data:${clip.mimeType || 'audio/wav'};base64,${clip.audioBase64}`;
    const cleanName = (clip.text.slice(0, 24).replace(/[^a-zA-Z0-9]/g, '_') || 'gemini_voice') + '.wav';
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyBase64 = async () => {
    if (!clip?.audioBase64) return;
    try {
      await navigator.clipboard.writeText(`data:${clip.mimeType || 'audio/wav'};base64,${clip.audioBase64}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy audio', e);
    }
  };

  // Canvas visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const renderWave = () => {
      frame++;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const numBars = 54;
      const barWidth = width / numBars - 2;
      const progress = duration > 0 ? currentTime / duration : 0;

      for (let i = 0; i < numBars; i++) {
        const barProgress = i / numBars;
        const isPassed = barProgress <= progress;

        let barHeight = 0;
        if (isPlaying) {
          const wave1 = Math.sin((i * 0.3) + (frame * 0.08)) * 0.5 + 0.5;
          const wave2 = Math.cos((i * 0.5) - (frame * 0.05)) * 0.5 + 0.5;
          barHeight = 10 + (wave1 * 0.6 + wave2 * 0.4) * (height - 18);
        } else {
          const pseudoFreq = (Math.sin(i * 0.45) * 0.5 + 0.5) * (Math.cos(i * 0.2) * 0.5 + 0.5);
          barHeight = 8 + pseudoFreq * (height - 24);
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        if (isPassed) {
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#a855f7');
          grad.addColorStop(1, '#3b82f6');
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = '#334155';
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, currentTime, duration]);

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const seekSliderId = useId();
  const volumeSliderId = useId();

  if (!clip) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <Music className="w-7 h-7" />
        </div>
        <h4 className="text-slate-300 font-semibold text-lg mb-1">Audio Player Ready</h4>
        <p className="text-slate-400 text-sm max-w-sm">
          Type your words above or pick a preset script, select a voice, and hit <span className="text-indigo-400 font-medium">Generate Voice Audio</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Voice: {clip.voice}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {clip.model.replace('gemini-', '')} • 24kHz WAV
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyBase64}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-colors"
            title="Copy Audio Data URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied URI' : 'Copy Audio'}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            Download WAV
          </button>
        </div>
      </div>

      <div className="mb-4 bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 text-sm text-slate-200 line-clamp-2 italic leading-relaxed">
        "{clip.text}"
      </div>

      <div className="relative mb-3 bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={640}
          height={68}
          className="w-full h-16 block cursor-pointer"
          onClick={() => {
            if (audioRef.current) togglePlay();
          }}
        />
        <div className="absolute top-2 right-3 text-[11px] font-mono text-slate-400">
          {isPlaying ? 'PLAYING' : 'READY'}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor={seekSliderId} className="sr-only">Seek Audio</label>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1 px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          id={seekSliderId}
          type="range"
          min="0"
          max={duration || 100}
          step="0.05"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <button
            onClick={() => skipSeconds(-5)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Rewind 5s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={() => skipSeconds(5)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Forward 5s"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-lg transition-colors ${
              isLooping ? 'text-indigo-400 bg-indigo-500/15' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title="Loop audio"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          {[0.75, 1, 1.25, 1.5, 2].map(rate => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                playbackRate === rate
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor={volumeSliderId} className="sr-only">Volume</label>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            id={volumeSliderId}
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
