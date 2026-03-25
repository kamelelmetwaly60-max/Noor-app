import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Volume2, WifiOff, Loader2 } from 'lucide-react';
import { Link } from 'wouter';

const STATIONS = [
  {
    id: 1,
    name: 'إذاعة القرآن الكريم',
    freq: '98.2 FM',
    url: 'https://n14d.radiojar.com/mnvqp44w3p8uv',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.35)',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.35)',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M12 3a9 9 0 0 1 0 18M12 3a9 9 0 0 0 0 18M12 3v18M3 12h18"/>
        <path d="M5.6 5.6a12 12 0 0 0 0 12.8M18.4 5.6a12 12 0 0 1 0 12.8"/>
      </svg>
    ),
  },
  {
    id: 2,
    name: 'إذاعة البرنامج العام',
    freq: '107.4 FM',
    url: 'https://n14d.radiojar.com/m2ytrjfp98zuv',
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.35)',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.35)',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect x="3" y="7" width="18" height="13" rx="2"/>
        <line x1="10" y1="2" x2="7" y2="7"/><line x1="14" y1="2" x2="17" y2="7"/>
        <circle cx="9" cy="13.5" r="2.5"/>
        <circle cx="16" cy="11" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="16" cy="15" r="1.2" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 3,
    name: 'راديو مصر',
    freq: '88.7 FM',
    url: 'https://stream.radiojar.com/p2qhb05kfpzuv',
    color: '#C19A6B',
    glow: 'rgba(193,154,107,0.4)',
    bg: 'rgba(193,154,107,0.1)',
    border: 'rgba(193,154,107,0.4)',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    ),
  },
  {
    id: 4,
    name: 'إذاعة الشباب والرياضة',
    freq: '108.0 FM',
    url: 'https://stream.radiojar.com/pn5dhs0qu6zuv',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.35)',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.35)',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 3C8 7 8 17 12 21M12 3c4 4 4 14 0 18M3 12h18"/>
        <path d="M4.5 7.5C7 8 10 8 12 8s5-.3 7.5-.5M4.5 16.5C7 16 10 16 12 16s5 .3 7.5.5"/>
      </svg>
    ),
  },
  {
    id: 5,
    name: 'إذاعة الشرق الأوسط',
    freq: '89.5 FM',
    url: 'https://stream.radiojar.com/xw2sfhkqq3zuv',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.35)',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.35)',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 3C8 7 8 17 12 21M12 3c4 4 4 14 0 18"/>
        <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
      </svg>
    ),
  },
];

type Status = 'idle' | 'loading' | 'playing' | 'error';

function Equalizer({ color }: { color: string }) {
  return (
    <div className="flex gap-0.5 items-end h-5">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="w-1 rounded-full"
          style={{
            background: color,
            height: `${8 + (i % 3) * 5}px`,
            animation: `eq${i} ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

export function EgyptianRadio() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [status, setStatus]     = useState<Status>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio();
    a.crossOrigin = 'anonymous';
    audioRef.current = a;
    a.addEventListener('waiting',  () => setStatus('loading'));
    a.addEventListener('playing',  () => setStatus('playing'));
    a.addEventListener('error',    () => setStatus('error'));
    a.addEventListener('stalled',  () => setStatus('loading'));
    a.addEventListener('pause',    () => {});
    return () => { a.pause(); a.src = ''; };
  }, []);

  const toggle = useCallback((station: typeof STATIONS[0]) => {
    const a = audioRef.current;
    if (!a) return;
    if (activeId === station.id && status === 'playing') {
      a.pause(); a.src = '';
      setActiveId(null); setStatus('idle');
      return;
    }
    a.pause(); a.src = station.url;
    setActiveId(station.id); setStatus('loading');
    a.play().catch(() => setStatus('error'));
  }, [activeId, status]);

  const activeStation = STATIONS.find(s => s.id === activeId);

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto bg-background" dir="rtl">
      <style>{`
        @keyframes eq1 { from{transform:scaleY(.3)} to{transform:scaleY(1)} }
        @keyframes eq2 { from{transform:scaleY(.6)} to{transform:scaleY(1)} }
        @keyframes eq3 { from{transform:scaleY(.2)} to{transform:scaleY(.9)} }
        @keyframes eq4 { from{transform:scaleY(.5)} to{transform:scaleY(1)} }
      `}</style>

      <div className="px-4 py-4 flex items-center gap-4 bg-card shadow-sm border-b border-border flex-shrink-0">
        <Link href="/more">
          <button className="p-2 bg-secondary rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-xl" style={{ fontFamily: '"Tajawal", sans-serif' }}>الإذاعات المصرية</h1>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            {activeStation ? `${activeStation.name} — ${activeStation.freq}` : 'اختر إذاعة للاستماع'}
          </p>
        </div>
        {activeStation && status === 'playing' && (
          <Equalizer color={activeStation.color} />
        )}
      </div>

      {activeStation && (
        <div
          className="mx-4 mt-4 p-4 rounded-2xl flex items-center gap-4 flex-shrink-0"
          style={{ background: activeStation.bg, border: `1px solid ${activeStation.border}`, boxShadow: `0 0 24px ${activeStation.glow}` }}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-0.5 items-end h-8">
              {status === 'playing'
                ? [1,2,3,4,5].map(i => (
                    <div key={i} className="w-1.5 rounded-full"
                      style={{ background: activeStation.color, height: `${12 + (i%3)*10}px`, animation: `eq${(i%4)+1} ${0.3+i*0.1}s ease-in-out infinite alternate` }} />
                  ))
                : status === 'loading'
                  ? <Loader2 className="w-6 h-6 animate-spin" style={{ color: activeStation.color }} />
                  : <WifiOff className="w-6 h-6" style={{ color: activeStation.color }} />
              }
            </div>
          </div>
          <div className="flex-1">
            <p className="font-bold" style={{ fontFamily: '"Tajawal", sans-serif', color: activeStation.color }}>{activeStation.name}</p>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              {status === 'loading' ? 'جاري الاتصال...' : status === 'error' ? 'تعذّر الاتصال بالإذاعة' : `${activeStation.freq} • يبث الآن`}
            </p>
          </div>
          <Volume2 className="w-5 h-5 flex-shrink-0" style={{ color: activeStation.color }} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-3">
        {STATIONS.map(s => {
          const isActive  = activeId === s.id;
          const isLoading = isActive && status === 'loading';
          const isError   = isActive && status === 'error';
          const isPlaying = isActive && status === 'playing';

          return (
            <button
              key={s.id}
              onClick={() => toggle(s)}
              className="w-full p-5 rounded-2xl border text-right transition-all duration-300"
              style={{
                background: isActive ? s.bg : undefined,
                borderColor: isActive ? s.border : undefined,
                boxShadow: isPlaying ? `0 0 24px ${s.glow}, 0 4px 16px rgba(0,0,0,0.08)` : undefined,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{
                    background: isActive ? s.color : 'transparent',
                    border: isActive ? 'none' : `2px solid ${s.color}40`,
                    color: isActive ? '#fff' : s.color,
                    boxShadow: isPlaying ? `0 0 16px ${s.glow}` : undefined,
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: isActive ? '#fff' : s.color }} />
                  ) : isError ? (
                    <WifiOff className="w-6 h-6" style={{ color: isActive ? '#fff' : s.color }} />
                  ) : (
                    s.svgIcon
                  )}
                </div>

                <div className="flex-1 text-right">
                  <p
                    className="font-bold text-base leading-tight"
                    style={{ fontFamily: '"Tajawal", sans-serif', color: isActive ? s.color : undefined }}
                  >
                    {s.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                    {s.freq}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: isActive ? s.color : `${s.color}15` }}>
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill={isActive ? '#fff' : s.color} className="w-5 h-5">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill={isActive ? '#fff' : s.color} className="w-5 h-5">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
