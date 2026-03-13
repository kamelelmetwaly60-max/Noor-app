import { useState, useRef, useEffect } from 'react';
import { useReciters } from '@/hooks/use-api';
import { ArrowLeft, Search, Play, Pause, Music } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

export function Reciters() {
  const { data: reciters, isLoading } = useReciters();
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedMoshafId, setSelectedMoshafId] = useState<Record<string, number>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setPlayingId(null);
      audioRef.current.onerror = () => setPlayingId(null);
    }
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const togglePlay = (id: string, server: string, moshafIdx: number) => {
    if (!audioRef.current) return;
    if (playingId === `${id}-${moshafIdx}`) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.pause();
      // Play Al-Fatiha (001) as sample - first surah mp3
      audioRef.current.src = `${server}001.mp3`;
      audioRef.current.play().catch(() => setPlayingId(null));
      setPlayingId(`${id}-${moshafIdx}`);
    }
  };

  const filtered = reciters?.filter((r: any) =>
    r.name.includes(search) || r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto bg-background" dir="rtl">
      <div className="pt-safe px-4 py-4 flex items-center gap-4 bg-card shadow-sm z-10 border-b border-border">
        <Link href="/more" className="p-2 bg-secondary rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-xl">القراء والاستماع</h1>
          {reciters && (
            <p className="text-xs text-muted-foreground">{reciters.length} قارئ</p>
          )}
        </div>
      </div>

      <div className="p-4 border-b border-border bg-card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث عن قارئ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-2xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-muted-foreground font-bold">جاري تحميل القراء...</p>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {filtered?.map((r: any) => {
              const moshafs = r.moshaf ?? [];
              if (!moshafs.length) return null;

              return moshafs.map((moshaf: any, mi: number) => {
                if (!moshaf.server) return null;
                const uid = `${r.id}-${mi}`;
                const isPlaying = playingId === uid;

                return (
                  <div key={uid} className="bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">{r.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Music className="w-3 h-3" />
                          {moshaf.name}
                        </p>
                      </div>
                      <button
                        onClick={() => togglePlay(r.id, moshaf.server, mi)}
                        className={cn(
                          'mr-3 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0',
                          isPlaying
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110'
                            : 'bg-secondary text-primary hover:bg-primary/10'
                        )}
                        aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 translate-x-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              });
            })}

            {filtered?.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <p>لا توجد نتائج لـ "{search}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
