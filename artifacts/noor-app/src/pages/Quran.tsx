import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuranSurahs, useSurah, useTafsir } from '@/hooks/use-api';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { QURAN_RECITERS } from '@/lib/constants';
import {
  Search, Headphones, FileText, Bookmark, X, ChevronRight,
  Play, Pause, SkipForward, SkipBack, ChevronDown
} from 'lucide-react';
import { padZero, cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';

type Mode = 'normal' | 'listen' | 'tafsir';

export function Quran() {
  const { data: surahs, isLoading: loadingList } = useQuranSurahs();
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const { data: surahData, isLoading: loadingSurah } = useSurah(selectedSurah ?? 0);

  const [mode, setMode] = useState<Mode>('normal');
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [currentJuz, setCurrentJuz] = useState<number | null>(null);
  const [currentHizb, setCurrentHizb] = useState<number | null>(null);

  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [selectedReciterId, setSelectedReciterId] = useLocalStorage('quran_reciter', 'ajamy');
  const [showReciterPicker, setShowReciterPicker] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: tafsirData } = useTafsir(selectedSurah ?? 0, activeAyah ?? 0);

  const [bookmark, setBookmark] = useLocalStorage<{ surah: number; ayah: number } | null>('quran_bookmark', null);
  const [memorized, setMemorized] = useLocalStorage<string[]>('quran_memorized', []);

  const totalAyahs = surahData?.numberOfAyahs ?? surahData?.ayahs?.length ?? 0;

  // Setup audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('durationchange', () => setDuration(audio.duration || 0));
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      // Auto-advance to next ayah
      setActiveAyah(prev => {
        if (prev && prev < totalAyahs) {
          const next = prev + 1;
          loadAndPlay(next);
          return next;
        }
        return prev;
      });
    });
    audio.addEventListener('waiting', () => setAudioLoading(true));
    audio.addEventListener('canplay', () => setAudioLoading(false));
    audio.addEventListener('error', () => { setIsPlaying(false); setAudioLoading(false); });

    return () => audio.pause();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAudioUrl = (surahNum: number, ayahNum: number, reciterId: string) => {
    const reciter = QURAN_RECITERS.find(r => r.id === reciterId) ?? QURAN_RECITERS[0];
    return `https://everyayah.com/data/${reciter.folder}/${padZero(surahNum, 3)}${padZero(ayahNum, 3)}.mp3`;
  };

  const loadAndPlay = useCallback((ayahNum: number) => {
    if (!audioRef.current || !selectedSurah) return;
    const url = getAudioUrl(selectedSurah, ayahNum, selectedReciterId);
    setAudioLoading(true);
    audioRef.current.src = url;
    audioRef.current.load();
    audioRef.current.play().catch(() => setIsPlaying(false));
    setActiveAyah(ayahNum);
    // Scroll to ayah
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-ayah="${ayahNum}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurah, selectedReciterId]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (activeAyah) {
        audioRef.current.play().catch(() => {});
      } else {
        loadAndPlay(1);
      }
    }
  };

  const seekAudio = (pct: number) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = pct * duration;
  };

  const prevAyah = () => {
    if (activeAyah && activeAyah > 1) loadAndPlay(activeAyah - 1);
  };
  const nextAyah = () => {
    if (activeAyah && activeAyah < totalAyahs) loadAndPlay(activeAyah + 1);
  };

  // When reciter changes, reload current ayah
  useEffect(() => {
    if (mode === 'listen' && activeAyah && selectedSurah) {
      loadAndPlay(activeAyah);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReciterId]);

  const handleAyahClick = (ayahNum: number) => {
    if (mode === 'normal') {
      // Single tap = bookmark
      if (selectedSurah) {
        setBookmark({ surah: selectedSurah, ayah: ayahNum });
      }
      return;
    }
    if (mode === 'listen') {
      loadAndPlay(ayahNum);
    } else if (mode === 'tafsir') {
      setActiveAyah(ayahNum);
    }
  };

  const toggleMemorized = (ayahKey: string) => {
    setMemorized(prev =>
      prev.includes(ayahKey) ? prev.filter(k => k !== ayahKey) : [...prev, ayahKey]
    );
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !surahData) return;
    const container = scrollRef.current;
    const ayahEls = container.querySelectorAll<HTMLElement>('[data-ayah]');
    const containerTop = container.scrollTop;
    for (const el of ayahEls) {
      if (el.offsetTop - containerTop > -10) {
        const juz = el.dataset.juz;
        const hizb = el.dataset.hizb;
        if (juz) setCurrentJuz(parseInt(juz));
        if (hizb) setCurrentHizb(parseFloat(hizb));
        break;
      }
    }
  }, [surahData]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const filteredSurahs = surahs?.filter(
    s => s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase())
  );

  // ── Surah list ──
  if (!selectedSurah) {
    return (
      <div className="pb-24 pt-6 px-4 max-w-lg mx-auto h-screen flex flex-col" dir="rtl">
        <h1 className="text-2xl font-bold mb-4">القرآن الكريم</h1>

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث عن سورة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border-2 border-border rounded-2xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {bookmark && (
          <button
            onClick={() => setSelectedSurah(bookmark.surah)}
            className="mb-4 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between hover:bg-primary/20 transition-all text-right"
          >
            <div>
              <p className="text-sm text-primary mb-1 flex items-center gap-1">
                <Bookmark className="w-4 h-4" /> العلامة المحفوظة
              </p>
              <p className="font-bold">
                سورة {surahs?.find(s => s.number === bookmark.surah)?.name} — الآية {bookmark.ayah}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 pb-4">
          {loadingList ? (
            <div className="text-center py-10 text-primary animate-pulse">جاري التحميل...</div>
          ) : (
            filteredSurahs?.map(s => (
              <button
                key={s.number}
                onClick={() => { setSelectedSurah(s.number); setMode('normal'); setActiveAyah(null); }}
                className="w-full bg-card hover:bg-secondary/50 p-4 rounded-2xl border border-border flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {s.number}
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-lg">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {s.numberOfAyahs} آية
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // ── Surah reader ──
  const hizbDisplay = currentHizb
    ? `حزب ${Math.ceil(currentHizb / 4)} • ربع ${Math.ceil(currentHizb) % 4 || 4}`
    : '';

  const fmtTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const currentReciter = QURAN_RECITERS.find(r => r.id === selectedReciterId) ?? QURAN_RECITERS[0];

  return (
    <div className="h-screen flex flex-col bg-background relative" dir="rtl">

      {/* ── Header ── */}
      <div className="px-4 py-3 bg-card border-b border-border shadow-sm flex items-center justify-between z-10 flex-shrink-0">
        <button
          onClick={() => {
            setSelectedSurah(null);
            setMode('normal');
            setActiveAyah(null);
            audioRef.current?.pause();
          }}
          className="p-2 bg-secondary rounded-full hover:bg-secondary/80"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center flex-1">
          <h2 className="font-bold text-lg">{surahs?.find(s => s.number === selectedSurah)?.name}</h2>
          <p className="text-xs text-primary">
            الجزء {currentJuz ?? surahData?.ayahs?.[0]?.juz ?? '—'}
            {hizbDisplay ? ` • ${hizbDisplay}` : ''}
          </p>
        </div>
        {/* Mode buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setMode(mode === 'listen' ? 'normal' : 'listen')}
            title="وضع الاستماع"
            className={cn(
              'p-2 rounded-full transition-all border',
              mode === 'listen'
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30'
                : 'bg-secondary text-foreground border-border'
            )}
          >
            <Headphones className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode(mode === 'tafsir' ? 'normal' : 'tafsir')}
            title="وضع التفسير"
            className={cn(
              'p-2 rounded-full transition-all border',
              mode === 'tafsir'
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30'
                : 'bg-secondary text-foreground border-border'
            )}
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode hint bar */}
      {mode !== 'normal' && (
        <div className="px-4 py-1.5 bg-primary/10 border-b border-primary/20 text-center flex-shrink-0">
          <p className="text-xs text-primary font-bold">
            {mode === 'listen' && '📻 اضغط على أي آية للاستماع إليها'}
            {mode === 'tafsir' && '📖 اضغط على أي آية لعرض تفسيرها'}
          </p>
        </div>
      )}
      {mode === 'normal' && (
        <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-center flex-shrink-0">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">
            📌 اضغط على أي آية لحفظ علامة • اضغط مرتين للتحديد كمحفوظة
          </p>
        </div>
      )}

      {/* ── Quran text ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 pb-4">
        {loadingSurah ? (
          <div className="text-center py-20 text-primary animate-pulse">جاري تحميل السورة...</div>
        ) : (
          <div className="bg-card rounded-3xl p-6 min-h-full border border-border/30 shadow-sm">
            {selectedSurah !== 1 && selectedSurah !== 9 && (
              <div className="text-center font-serif text-2xl mb-8 text-primary leading-loose">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}
            <div className="text-justify leading-[3.2rem] text-[1.7rem] font-serif text-foreground">
              {surahData?.ayahs?.map((ayah: any) => {
                let text = ayah.text;
                if (selectedSurah !== 1 && ayah.numberInSurah === 1) {
                  text = text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
                }
                const isActive = activeAyah === ayah.numberInSurah;
                const ayahKey = `${selectedSurah}:${ayah.numberInSurah}`;
                const isMemorized = memorized.includes(ayahKey);
                const isBookmarked = bookmark?.surah === selectedSurah && bookmark?.ayah === ayah.numberInSurah;

                return (
                  <span
                    key={ayah.numberInSurah}
                    data-ayah={ayah.numberInSurah}
                    data-juz={ayah.juz}
                    data-hizb={ayah.hizbQuarter}
                    onClick={() => handleAyahClick(ayah.numberInSurah)}
                    onDoubleClick={() => toggleMemorized(ayahKey)}
                    className={cn(
                      'inline cursor-pointer transition-all duration-200 rounded-sm px-0.5',
                      isActive && 'bg-primary/25 border-b-2 border-primary',
                      isBookmarked && !isActive && 'bg-amber-100/80 dark:bg-amber-900/30',
                      isMemorized && 'text-green-700 dark:text-green-400',
                      mode !== 'normal' && 'hover:bg-primary/10',
                      mode === 'normal' && 'hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
                    )}
                  >
                    {text}
                    <span className="inline-flex items-center justify-center w-8 h-8 mx-1.5 rounded-full border border-primary/30 text-primary text-sm font-sans align-middle text-[0.8rem]">
                      {ayah.numberInSurah}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Audio Player Panel (shown when mode === 'listen') ── */}
      {mode === 'listen' && (
        <div className="flex-shrink-0 bg-card border-t border-border shadow-2xl px-4 pt-3 pb-4">
          {/* Reciter selector */}
          <div className="relative mb-2">
            <button
              onClick={() => setShowReciterPicker(!showReciterPicker)}
              className="w-full flex items-center justify-between bg-secondary border border-border rounded-2xl px-4 py-2.5 text-sm"
            >
              <span className="font-bold text-primary">{currentReciter.name}</span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', showReciterPicker && 'rotate-180')} />
            </button>

            {showReciterPicker && (
              <div className="absolute bottom-full mb-1 left-0 right-0 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                {QURAN_RECITERS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedReciterId(r.id);
                      setShowReciterPicker(false);
                    }}
                    className={cn(
                      'w-full text-right px-4 py-3 text-sm transition-colors border-b border-border/30 last:border-0',
                      r.id === selectedReciterId ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-secondary'
                    )}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current ayah label */}
          <div className="text-center text-xs text-muted-foreground mb-1">
            {activeAyah
              ? `الآية ${activeAyah} من ${totalAyahs}`
              : 'اضغط على آية للاستماع'}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground w-8 text-left">{fmtTime(currentTime)}</span>
            <div
              className="flex-1 h-2 bg-secondary rounded-full relative cursor-pointer overflow-hidden"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                seekAudio((e.clientX - rect.left) / rect.width);
              }}
            >
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8">{fmtTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prevAyah}
              disabled={!activeAyah || activeAyah <= 1}
              className="p-3 bg-secondary rounded-full disabled:opacity-30 hover:bg-secondary/80 transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
            >
              {audioLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7 translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextAyah}
              disabled={!activeAyah || activeAyah >= totalAyahs}
              className="p-3 bg-secondary rounded-full disabled:opacity-30 hover:bg-secondary/80 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Tafsir modal ── */}
      <Dialog.Root
        open={mode === 'tafsir' && !!activeAyah && !!tafsirData}
        onOpenChange={open => { if (!open) setActiveAyah(null); }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content
            className="fixed bottom-0 left-0 right-0 max-h-[75vh] bg-card rounded-t-3xl p-6 z-50 overflow-y-auto shadow-2xl"
            dir="rtl"
          >
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-5" />
            <Dialog.Title className="text-lg font-bold text-primary mb-4">
              تفسير الجلالين — الآية {activeAyah}
            </Dialog.Title>
            <div
              className="text-lg leading-loose font-serif"
              dangerouslySetInnerHTML={{ __html: tafsirData?.text ?? 'جاري التحميل...' }}
            />
            <button
              onClick={() => setActiveAyah(null)}
              className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-2xl font-bold"
            >
              إغلاق
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
