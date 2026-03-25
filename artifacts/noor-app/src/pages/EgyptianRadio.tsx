import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Volume2, WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

/* ─── Egyptian Islamic Radio Stations ─────────────────────── */
const STATIONS = [
  {
    id: 1,
    name: 'إذاعة القرآن الكريم',
    subtitle: 'الإذاعة المصرية · 98.2 FM',
    url: 'https://n14d.radiojar.com/mnvqp44w3p8uv',
    fallbackUrls: [
      'https://radioegypt.radioca.st/quran',
      'https://stream.radiojar.com/mnvqp44w3p8uv',
    ],
    color: '#10B981',
    glow: 'rgba(16,185,129,0.4)',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.3)',
    svgLogo: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect width="48" height="48" rx="12" fill="#10B981" opacity="0.15"/>
        {/* Open Quran */}
        <path d="M24 10 C20 10 10 12 9 16 L9 38 C10 35 20 33 24 33" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 10 C28 10 38 12 39 16 L39 38 C38 35 28 33 24 33" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="24" y1="10" x2="24" y2="33" stroke="#10B981" strokeWidth="1.5"/>
        {/* Radio waves */}
        <path d="M4 28 Q4 20 8 16" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M2 32 Q2 18 8 12" stroke="#10B981" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.4"/>
        <path d="M44 28 Q44 20 40 16" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M46 32 Q46 18 40 12" stroke="#10B981" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
  },
  {
    id: 2,
    name: 'إذاعة الحياة الإسلامية',
    subtitle: 'الإذاعة المصرية · 95.2 FM',
    url: 'https://n14d.radiojar.com/m2ytrjfp98zuv',
    fallbackUrls: [
      'https://radioegypt.radioca.st/islamic',
      'https://stream.radiojar.com/m2ytrjfp98zuv',
    ],
    color: '#C19A6B',
    glow: 'rgba(193,154,107,0.4)',
    bg: 'rgba(193,154,107,0.1)',
    border: 'rgba(193,154,107,0.3)',
    svgLogo: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect width="48" height="48" rx="12" fill="#C19A6B" opacity="0.15"/>
        {/* Mosque dome */}
        <path d="M14 28 Q14 18 24 16 Q34 18 34 28" stroke="#C19A6B" strokeWidth="2" strokeLinecap="round"/>
        <rect x="12" y="28" width="24" height="12" rx="1" stroke="#C19A6B" strokeWidth="1.8"/>
        {/* Minaret left */}
        <rect x="8" y="22" width="4" height="18" rx="0.8" stroke="#C19A6B" strokeWidth="1.5"/>
        <path d="M8 22 Q10 18 12 22" stroke="#C19A6B" strokeWidth="1.2" fill="none"/>
        {/* Minaret right */}
        <rect x="36" y="22" width="4" height="18" rx="0.8" stroke="#C19A6B" strokeWidth="1.5"/>
        <path d="M36 22 Q38 18 40 22" stroke="#C19A6B" strokeWidth="1.2" fill="none"/>
        {/* Crescent on top */}
        <path d="M22 13 Q24 9 27 13" stroke="#C19A6B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 3,
    name: 'إذاعة القرآن الكريم',
    subtitle: 'راديو مصر الديني · بث مباشر',
    url: 'https://radioegypt.radioca.st/quran2',
    fallbackUrls: [
      'https://n14d.radiojar.com/cfuouuun7yzuv',
      'https://stream.radiojar.com/cfuouuun7yzuv',
    ],
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.4)',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.3)',
    svgLogo: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect width="48" height="48" rx="12" fill="#3B82F6" opacity="0.15"/>
        {/* Star & Crescent */}
        <path d="M24 10 C15 10 9 17 9 24 C9 31 15 38 24 38 C31 38 37 33 38 26 C35 29 30 30 26 28 C20 25 18 18 22 13 C22.5 12 23 11 24 10Z" stroke="#3B82F6" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <polygon points="32,14 33.5,18.5 38,18.5 34.5,21.5 36,26 32,23 28,26 29.5,21.5 26,18.5 30.5,18.5" stroke="#3B82F6" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
  },
  {
    id: 4,
    name: 'نور القرآن الكريم',
    subtitle: 'إذاعة إسلامية مصرية · تلاوات خاشعة',
    url: 'https://n14d.radiojar.com/0t240xbtftzuv',
    fallbackUrls: [
      'https://stream.radiojar.com/0t240xbtftzuv',
    ],
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.4)',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.3)',
    svgLogo: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect width="48" height="48" rx="12" fill="#8B5CF6" opacity="0.15"/>
        {/* Light rays / nour */}
        <circle cx="24" cy="24" r="8" stroke="#8B5CF6" strokeWidth="1.8"/>
        <line x1="24" y1="8" x2="24" y2="12" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="24" y1="36" x2="24" y2="40" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="8" y1="24" x2="12" y2="24" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="36" y1="24" x2="40" y2="24" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="13.4" y1="13.4" x2="16.2" y2="16.2" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <line x1="31.8" y1="31.8" x2="34.6" y2="34.6" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <line x1="34.6" y1="13.4" x2="31.8" y2="16.2" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <line x1="16.2" y1="31.8" x2="13.4" y2="34.6" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <circle cx="24" cy="24" r="3" fill="#8B5CF6"/>
      </svg>
    ),
  },
  {
    id: 5,
    name: 'أصوات القرآن الكريم',
    subtitle: 'تلاوات مصرية · بث متواصل',
    url: 'https://n14d.radiojar.com/cfuouuun7yzuv',
    fallbackUrls: [
      'https://stream.radiojar.com/mnvqp44w3p8uv',
    ],
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.4)',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    svgLogo: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect width="48" height="48" rx="12" fill="#F59E0B" opacity="0.15"/>
        {/* Microphone */}
        <rect x="18" y="8" width="12" height="18" rx="6" stroke="#F59E0B" strokeWidth="2"/>
        <path d="M12 26 Q12 38 24 38 Q36 38 36 26" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="24" y1="38" x2="24" y2="42" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        <line x1="18" y1="42" x2="30" y2="42" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        {/* Sound waves inside mic */}
        <line x1="20" y1="18" x2="28" y2="18" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
        <line x1="20" y1="21" x2="28" y2="21" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
  },
];

type Status = 'idle' | 'loading' | 'playing' | 'error';

function Bars({ color, playing }: { color: string; playing: boolean }) {
  return (
    <div className="flex gap-0.5 items-end h-5">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="w-1 rounded-full transition-all duration-300"
          style={{
            background: color,
            height: playing ? `${8 + (i % 3) * 6}px` : '4px',
            animation: playing ? `eqbar ${0.4 + i * 0.1}s ease-in-out infinite alternate` : 'none',
          }} />
      ))}
    </div>
  );
}

export function EgyptianRadio() {
  const [activeId, setActiveId]         = useState<number | null>(null);
  const [status, setStatus]             = useState<Status>('idle');
  const [fallbackIdx, setFallbackIdx]   = useState<Record<number, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio();
    a.crossOrigin = 'anonymous';
    audioRef.current = a;

    const onWaiting  = () => setStatus(s => s !== 'error' ? 'loading' : s);
    const onPlaying  = () => setStatus('playing');
    const onError    = () => setStatus('error');
    const onStalled  = () => setStatus(s => s !== 'error' ? 'loading' : s);

    a.addEventListener('waiting',  onWaiting);
    a.addEventListener('playing',  onPlaying);
    a.addEventListener('error',    onError);
    a.addEventListener('stalled',  onStalled);
    return () => {
      a.pause(); a.src = '';
      a.removeEventListener('waiting',  onWaiting);
      a.removeEventListener('playing',  onPlaying);
      a.removeEventListener('error',    onError);
      a.removeEventListener('stalled',  onStalled);
    };
  }, []);

  const tryPlay = useCallback((station: typeof STATIONS[0], url: string) => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.src = url;
    setStatus('loading');
    a.load();
    a.play().catch(() => {
      // Try fallback
      setFallbackIdx(prev => {
        const idx = (prev[station.id] ?? -1) + 1;
        if (idx < station.fallbackUrls.length) {
          setTimeout(() => tryPlay(station, station.fallbackUrls[idx]), 500);
          return { ...prev, [station.id]: idx };
        }
        setStatus('error');
        return prev;
      });
    });
  }, []);

  const toggle = useCallback((station: typeof STATIONS[0]) => {
    const a = audioRef.current;
    if (!a) return;

    if (activeId === station.id) {
      if (status === 'playing' || status === 'loading') {
        a.pause(); a.src = '';
        setStatus('idle'); setActiveId(null);
      } else {
        // retry from primary
        setFallbackIdx(prev => ({ ...prev, [station.id]: -1 }));
        tryPlay(station, station.url);
      }
      return;
    }

    setActiveId(station.id);
    setFallbackIdx(prev => ({ ...prev, [station.id]: -1 }));
    tryPlay(station, station.url);
  }, [activeId, status, tryPlay]);

  const activeStation = STATIONS.find(s => s.id === activeId);

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto bg-background" dir="rtl">
      <style>{`
        @keyframes eqbar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>

      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-4 bg-card shadow-sm border-b border-border flex-shrink-0">
        <Link href="/more">
          <button className="p-2 bg-secondary rounded-full"><ArrowLeft className="w-5 h-5" /></button>
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-xl" style={{ fontFamily: '"Tajawal", sans-serif' }}>الإذاعات الإسلامية المصرية</h1>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            {activeStation ? activeStation.name : 'اختر إذاعة للاستماع'}
          </p>
        </div>
        {activeStation && status === 'playing' && (
          <Bars color={activeStation.color} playing={true} />
        )}
      </div>

      {/* Now Playing Bar */}
      {activeStation && (
        <div className="mx-4 mt-4 p-4 rounded-2xl flex items-center gap-4 flex-shrink-0"
          style={{
            background: activeStation.bg,
            border: `1px solid ${activeStation.border}`,
            boxShadow: status === 'playing' ? `0 0 28px ${activeStation.glow}` : undefined,
          }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-background/50"
            style={{ border: `1.5px solid ${activeStation.border}` }}>
            {activeStation.svgLogo}
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ fontFamily: '"Tajawal", sans-serif', color: activeStation.color }}>{activeStation.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              {status === 'loading' ? 'جاري الاتصال بالخادم...'
              : status === 'error' ? '⚠️ تعذّر الاتصال — اضغط للمحاولة مجدداً'
              : `${activeStation.subtitle} • يبث الآن`}
            </p>
          </div>
          <div className="flex-shrink-0">
            {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: activeStation.color }} />
            : status === 'playing' ? <Volume2 className="w-5 h-5" style={{ color: activeStation.color }} />
            : status === 'error' ? <WifiOff className="w-5 h-5 text-destructive" />
            : null}
          </div>
        </div>
      )}

      {/* Station List */}
      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-3">
        {STATIONS.map(s => {
          const isActive  = activeId === s.id;
          const isLoading = isActive && status === 'loading';
          const isError   = isActive && status === 'error';
          const isPlaying = isActive && status === 'playing';

          return (
            <button key={s.id} onClick={() => toggle(s)}
              className="w-full p-4 rounded-2xl border text-right transition-all duration-300 active:scale-[0.98]"
              style={{
                background: isActive ? s.bg : undefined,
                borderColor: isActive ? s.border : 'var(--border)',
                boxShadow: isPlaying ? `0 0 20px ${s.glow}, 0 2px 12px rgba(0,0,0,0.06)` : undefined,
              }}>
              <div className="flex items-center gap-4">
                {/* Logo */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all bg-card"
                  style={{ border: isActive ? `2px solid ${s.border}` : '2px solid transparent' }}>
                  {s.svgLogo}
                </div>

                {/* Info */}
                <div className="flex-1 text-right">
                  <p className="font-bold text-base leading-tight" style={{ fontFamily: '"Tajawal", sans-serif', color: isActive ? s.color : undefined }}>
                    {s.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: '"Tajawal", sans-serif' }}>{s.subtitle}</p>
                </div>

                {/* Play/Pause button */}
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: isActive ? s.color : `${s.color}18` }}>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: isActive ? '#fff' : s.color }} />
                  ) : isError ? (
                    <RefreshCw className="w-5 h-5" style={{ color: isActive ? '#fff' : s.color }} />
                  ) : isPlaying ? (
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

              {/* Equalizer when playing */}
              {isPlaying && (
                <div className="flex gap-1 items-end mt-3 px-1" style={{ height: 16 }}>
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="flex-1 rounded-sm"
                      style={{
                        background: s.color,
                        height: `${30 + Math.sin(i * 0.8) * 50}%`,
                        opacity: 0.4 + (i % 3) * 0.2,
                        animation: `eqbar ${0.3 + (i % 5) * 0.1}s ease-in-out infinite alternate`,
                      }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}

        {/* Info */}
        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-muted-foreground/60" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            جميع الإذاعات إسلامية مصرية متخصصة
          </p>
        </div>
      </div>
    </div>
  );
}
