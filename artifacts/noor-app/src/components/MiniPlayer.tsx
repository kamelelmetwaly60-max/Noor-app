import { useAudio } from '@/contexts/AudioContext';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

function fmtTime(s: number) {
  if (!s || isNaN(s) || !isFinite(s)) return '0:00';
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

export function MiniPlayer() {
  const audio = useAudio();
  const [, navigate] = useLocation();

  // Only show if something is playing/paused and we're not on the reciters page
  if (!audio.surahNum) return null;

  const progress = audio.duration ? audio.currentTime / audio.duration : 0;

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-1 max-w-lg mx-auto"
      dir="rtl"
    >
      <div
        className={cn(
          'bg-card border border-border rounded-2xl shadow-2xl overflow-hidden',
          'shadow-black/20 backdrop-blur-sm'
        )}
        onClick={() => navigate('/reciters')}
      >
        {/* Progress bar */}
        <div className="h-0.5 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5">
          {/* Icon */}
          <div className="w-9 h-9 bg-primary/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-serif text-sm">ق</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">سورة {audio.surahName}</p>
            <p className="text-xs text-muted-foreground truncate">{audio.reciterName}</p>
          </div>

          {/* Time */}
          <p className="text-xs text-muted-foreground flex-shrink-0">
            {fmtTime(audio.currentTime)}
          </p>

          {/* Play/Pause */}
          <button
            onClick={e => { e.stopPropagation(); audio.togglePlay(); }}
            className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
          >
            {audio.isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : audio.isPlaying ? (
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 translate-x-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
