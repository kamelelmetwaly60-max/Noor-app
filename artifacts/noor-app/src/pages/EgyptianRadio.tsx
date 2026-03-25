import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Volume2, WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

/* ─── Islamic Radio Stations Data ──────────────────────────── */
const STATIONS = [
  {
    id: 1,
    name: 'إذاعة القرآن الكريم',
    subtitle: 'الإذاعة المصرية · 98.2 FM',
    url: 'https://n14d.radiojar.com/mnvqp44w3p8uv',
    logo: 'https://www.google.com/s2/favicons?domain=radioegypt.eu&sz=128',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.4)',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.3)',
    svgFallback: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <rect width="48" height="48" rx="12" fill="#10B981" opacity="0.2"/>
        <path d="M12 36V18c0-1 .7-2 1.7-2.3l16-5c1.5-.5 3.3.6 3.3 2.3v4" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="18" cy="36" r="4" stroke="#10B981" strokeWidth="2"/>
        <circle cx="34" cy="30" r="4" stroke="#10B981" strokeWidth="2"/>
        <line x1="22" y1="36" x2="30" y2="30" stroke="#10B981" strokeWidth="2"/>
        <line x1="22" y1="20" x2="33" y2="16" stroke="#10B981" strokeWidth="1.5" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: 2,
    name: 'إذاعة الحياة الإسلامية',
    subtitle: 'الإذاعة المصرية · إسلامية',
    url: 'https://n14d.radiojar.com/m2ytrjfp98zuv',
    logo: 'https://www.google.com/s2/favicons?domain=ertu.org&sz=128',
    color: '#C19A6B',
    glow: 'rgba(193,154,107,0.4)',
    bg: 'rgba(193,154,107,0.1)',
    border: 'rgba(193,154,107,0.3)',
    svgFallback: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <rect width="48" height="48" rx="12" fill="#C19A6B" opacity="0.2"/>
        <path d="M24 6C14.1 6 6 14.1 6 24s8.1 18 18 18 18-8.1 18-18S33.9 6 24 6z" stroke="#C19A6B" strokeWidth="2"/>
        <path d="M24 6c-4 6-4 30 0 36M24 6c4 6 4 30 0 36" stroke="#C19A6B" strokeWidth="1.5" opacity="0.6"/>
        <line x1="6" y1="20" x2="42" y2="20" stroke="#C19A6B" strokeWidth="1.5" opacity="0.6"/>
        <line x1="6" y1="28" x2="42" y2="28" stroke="#C19A6B" strokeWidth="1.5" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: 3,
    name: 'إذاعة القرآن الكريم',
    subtitle: 'هيئة الإذاعة السعودية · بث مباشر',
    url: 'https://Liveaudio.saudiradio.net/SaudiQuran',
    logo: 'https://www.google.com/s2/favicons?domain=saudiradio.net&sz=128',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.4)',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    svgFallback: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <rect width="48" height="48" rx="12" fill="#F59E0B" opacity="0.2"/>
        <path d="M24 10c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14S31.7 10 24 10z" stroke="#F59E0B" strokeWidth="2"/>
        <path d="M20 19l8 5-8 5V19z" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 4,
    name: 'راديو الإسلام',
    subtitle: 'إذاعة إسلامية عربية · بث مباشر',
    url: 'https://stream.radiojar.com/0t240xbtftzuv',
    logo: 'https://www.google.com/s2/favicons?domain=islamway.net&sz=128',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.4)',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.3)',
    svgFallback: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <rect width="48" height="48" rx="12" fill="#8B5CF6" opacity="0.2"/>
        <path d="M24 8l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9z" stroke="#8B5CF6" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 5,
    name: 'إذاعة نور القرآن',
    subtitle: 'قرآن كريم · تلاوات خاشعة',
    url: 'https://stream.radiojar.com/cfuouuun7yzuv',
    logo: 'https://www.google.com/s2/favicons?domain=mp3quran.net&sz=128',
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.4)',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.3)',
    svgFallback: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <rect width="48" height="48" rx="12" fill="#3B82F6" opacity="0.2"/>
        <rect x="10" y="12" width="28" height="24" rx="3" stroke="#3B82F6" strokeWidth="2"/>
        <line x1="18" y1="12" x2="18" y2="36" stroke="#3B82F6" strokeWidth="1.5"/>
        <line x1="13" y1="19" x2="16" y2="19" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="13" y1="22" x2="16" y2="22" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="13" y1="25" x2="16" y2="25" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="13" y1="28" x2="16" y2="28" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="21" y1="19" x2="35" y2="19" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
        <line x1="21" y1="22" x2="35" y2="22" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
        <line x1="21" y1="25" x2="35" y2="25" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
        <line x1="21" y1="28" x2="35" y2="28" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
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

function StationLogo({ logo, fallback, color }: { logo: string; fallback: React.ReactNode; color: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <img
      src={logo}
      alt=""
      className="w-8 h-8 rounded-lg object-contain"
      style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' }}
      onError={() => setFailed(true)}
    />
  );
}

export function EgyptianRadio() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [status, setStatus]     = useState<Status>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio();
    audioRef.current = a;
    a.addEventListener('waiting',  () => setStatus(s => s !== 'error' ? 'loading' : s));
    a.addEventListener('playing',  () => setStatus('playing'));
    a.addEventListener('error',    () => setStatus('error'));
    a.addEventListener('stalled',  () => setStatus(s => s !== 'error' ? 'loading' : s));
    return () => { a.pause(); a.src = ''; };
  }, []);

  const toggle = useCallback((station: typeof STATIONS[0]) => {
    const a = audioRef.current;
    if (!a) return;

    if (activeId === station.id) {
      if (status === 'playing' || status === 'loading') {
        a.pause(); a.src = '';
        setStatus('idle'); setActiveId(null);
      } else {
        // retry
        a.src = station.url;
        setStatus('loading');
        a.play().catch(() => setStatus('error'));
      }
      return;
    }

    a.pause();
    a.src = station.url;
    setActiveId(station.id);
    setStatus('loading');
    a.play().catch(() => setStatus('error'));
  }, [activeId, status]);

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
          <h1 className="font-bold text-xl" style={{ fontFamily: '"Tajawal", sans-serif' }}>الإذاعات الإسلامية</h1>
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
          style={{ background: activeStation.bg, border: `1px solid ${activeStation.border}`, boxShadow: status === 'playing' ? `0 0 28px ${activeStation.glow}` : undefined }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-background/50">
            <StationLogo logo={activeStation.logo} fallback={activeStation.svgFallback} color={activeStation.color} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ fontFamily: '"Tajawal", sans-serif', color: activeStation.color }}>{activeStation.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              {status === 'loading' ? 'جاري الاتصال...' : status === 'error' ? '⚠️ تعذّر الاتصال - اضغط للمحاولة مرة أخرى' : `${activeStation.subtitle} • يبث الآن`}
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
                borderColor: isActive ? s.border : undefined,
                boxShadow: isPlaying ? `0 0 20px ${s.glow}, 0 2px 12px rgba(0,0,0,0.06)` : undefined,
              }}>
              <div className="flex items-center gap-4">
                {/* Logo */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: isActive ? s.color + '20' : 'var(--secondary)', border: isActive ? `2px solid ${s.border}` : '2px solid transparent' }}>
                  <StationLogo logo={s.logo} fallback={s.svgFallback} color={s.color} />
                </div>

                {/* Info */}
                <div className="flex-1 text-right">
                  <p className="font-bold text-base leading-tight" style={{ fontFamily: '"Tajawal", sans-serif', color: isActive ? s.color : undefined }}>
                    {s.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: '"Tajawal", sans-serif' }}>{s.subtitle}</p>
                </div>

                {/* Play/Pause/Error button */}
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

              {/* Equalizer bar at bottom when playing */}
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
      </div>
    </div>
  );
}
