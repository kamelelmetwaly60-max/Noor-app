import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuranSurahs, useSurah, useTafsir } from '@/hooks/use-api';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { SURAH_NAMES } from '@/lib/constants';
import { Search, Headphones, FileText, Bookmark, X, ChevronRight } from 'lucide-react';
import { padZero, cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';

type Mode = 'normal' | 'listen' | 'tafsir';

// Word-level audio from qurancdn (Alafasy pronunciation)
function getWordAudioUrl(surah: number, ayah: number, wordIdx: number): string {
  return `https://audio.qurancdn.com/wbw/${padZero(surah, 3)}_${padZero(ayah, 3)}_${padZero(wordIdx, 3)}.mp3`;
}

export function Quran() {
  const { data: surahs, isLoading: loadingList } = useQuranSurahs();
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const { data: surahData, isLoading: loadingSurah } = useSurah(selectedSurah ?? 0);

  const [mode, setMode] = useState<Mode>('normal');
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [currentJuz, setCurrentJuz] = useState<number | null>(null);
  const [currentHizb, setCurrentHizb] = useState<number | null>(null);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const wordAudioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: tafsirData } = useTafsir(selectedSurah ?? 0, activeAyah ?? 0);

  const [bookmark, setBookmark] = useLocalStorage<{ surah: number; ayah: number } | null>('quran_bookmark', null);
  const [memorized, setMemorized] = useLocalStorage<string[]>('quran_memorized', []);

  useEffect(() => {
    if (!wordAudioRef.current) {
      wordAudioRef.current = new Audio();
      wordAudioRef.current.onended = () => setPlayingWord(null);
      wordAudioRef.current.onerror = () => setPlayingWord(null);
    }
  }, []);

  const playWord = (surah: number, ayah: number, wordPos: number) => {
    const wordKey = `${surah}:${ayah}:${wordPos}`;
    if (!wordAudioRef.current) return;
    wordAudioRef.current.pause();
    wordAudioRef.current.src = getWordAudioUrl(surah, ayah, wordPos);
    wordAudioRef.current.load();
    wordAudioRef.current.play().catch(() => setPlayingWord(null));
    setPlayingWord(wordKey);
  };

  const handleAyahClick = (ayahNum: number) => {
    if (mode === 'normal') {
      if (selectedSurah) setBookmark({ surah: selectedSurah, ayah: ayahNum });
    } else if (mode === 'tafsir') {
      setActiveAyah(ayahNum);
    }
  };

  const handleWordClick = (ayahNum: number, wordIdx: number) => {
    if (mode !== 'listen' || !selectedSurah) return;
    playWord(selectedSurah, ayahNum, wordIdx);
  };

  const toggleMemorized = (ayahKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemorized(prev => prev.includes(ayahKey) ? prev.filter(k => k !== ayahKey) : [...prev, ayahKey]);
  };

  // Reset Juz/Hizb when surah changes so header shows fresh data immediately
  useEffect(() => {
    setCurrentJuz(null);
    setCurrentHizb(null);
  }, [selectedSurah]);

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
    s => (SURAH_NAMES[s.number] ?? s.name).includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase())
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
            className="mb-4 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between hover:bg-primary/20 transition-all"
          >
            <div className="text-right">
              <p className="text-sm text-primary mb-1 flex items-center gap-1">
                <Bookmark className="w-4 h-4" /> العلامة المحفوظة
              </p>
              <p className="font-bold">
                سورة {SURAH_NAMES[bookmark.surah]} — الآية {bookmark.ayah}
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
                    {/* Use static name to avoid encoding issues */}
                    <h3 className="font-bold text-lg">{SURAH_NAMES[s.number] ?? s.name}</h3>
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
  const surahName = SURAH_NAMES[selectedSurah] ?? surahs?.find(s => s.number === selectedSurah)?.name ?? '';
  const hizbDisplay = currentHizb
    ? `حزب ${Math.ceil(currentHizb / 4)} • ربع ${Math.ceil(currentHizb) % 4 || 4}`
    : '';

  return (
    <div className="h-screen flex flex-col bg-background relative" dir="rtl">
      {/* ── Header ── */}
      <div className="px-4 py-3 bg-card border-b border-border shadow-sm flex items-center justify-between z-10 flex-shrink-0">
        <button
          onClick={() => { setSelectedSurah(null); setMode('normal'); setActiveAyah(null); wordAudioRef.current?.pause(); }}
          className="p-2 bg-secondary rounded-full hover:bg-secondary/80"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center flex-1">
          <h2 className="font-bold text-lg">{surahName}</h2>
          <p className="text-xs text-primary">
            الجزء {currentJuz ?? surahData?.ayahs?.[0]?.juz ?? '—'}
            {hizbDisplay ? ` • ${hizbDisplay}` : ''}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setMode(mode === 'listen' ? 'normal' : 'listen')}
            className={cn(
              'p-2 rounded-full transition-all border text-sm',
              mode === 'listen'
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30'
                : 'bg-secondary text-foreground border-border'
            )}
          >
            <Headphones className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode(mode === 'tafsir' ? 'normal' : 'tafsir')}
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

      {/* Mode hint */}
      {mode === 'listen' && (
        <div className="px-4 py-1.5 bg-primary/10 border-b border-primary/20 text-center flex-shrink-0">
          <p className="text-xs text-primary font-bold">👂 اضغط على أي كلمة لسماع نطقها</p>
        </div>
      )}
      {mode === 'tafsir' && (
        <div className="px-4 py-1.5 bg-primary/10 border-b border-primary/20 text-center flex-shrink-0">
          <p className="text-xs text-primary font-bold">📖 اضغط على أي آية لعرض تفسيرها</p>
        </div>
      )}
      {mode === 'normal' && (
        <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-center flex-shrink-0">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">📌 اضغط آية لحفظ علامة • اضغط مرتين لتحديدها محفوظة</p>
        </div>
      )}

      {/* ── Quran Text ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4">
        {loadingSurah ? (
          <div className="text-center py-20 text-primary animate-pulse">جاري تحميل السورة...</div>
        ) : (
          <div
            className="rounded-2xl min-h-full border border-primary/15 shadow-md overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #fdf8ef 0%, #fef9f0 100%)' }}
          >
            {/* Decorative top border */}
            <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #b8960c 0%, #d4a843 25%, #f0c040 50%, #d4a843 75%, #b8960c 100%)' }} />

            {/* Surah name banner */}
            <div className="text-center py-5 px-4 border-b border-amber-200/60"
              style={{ background: 'linear-gradient(180deg, #fdf3dc 0%, #fdf8ef 100%)' }}
            >
              {/* Decorative ornament top */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(to right, transparent, #b8960c)' }} />
                <svg width="18" height="18" viewBox="0 0 100 100"><polygon points="50,5 61,35 93,35 68,57 77,88 50,70 23,88 32,57 7,35 39,35" fill="#b8960c" opacity="0.8" /></svg>
                <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(to left, transparent, #b8960c)' }} />
              </div>

              <h2 className="text-3xl mb-1" style={{ fontFamily: '"Amiri Quran", "Amiri", serif', color: '#7a5c00' }}>{surahName}</h2>
              {selectedSurah !== 1 && selectedSurah !== 9 && (
                <p className="text-xl mt-2" style={{ fontFamily: '"Amiri Quran", "Amiri", serif', color: '#5a4200' }}>
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              )}

              {/* Decorative ornament bottom */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(to right, transparent, #b8960c)' }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#b8960c' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#b8960c' }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#b8960c' }} />
                <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(to left, transparent, #b8960c)' }} />
              </div>
            </div>

            <div
              className="p-5 text-justify leading-[3.4rem] text-[1.75rem]"
              style={{ fontFamily: '"Amiri Quran", "Amiri", serif', color: '#1a1200', direction: 'rtl' }}
            >
              {surahData?.ayahs?.map((ayah: any) => {
                let text: string = ayah.text;
                if (selectedSurah !== 1 && ayah.numberInSurah === 1) {
                  text = text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
                }
                const ayahKey = `${selectedSurah}:${ayah.numberInSurah}`;
                const isMemorized = memorized.includes(ayahKey);
                const isBookmarked = bookmark?.surah === selectedSurah && bookmark?.ayah === ayah.numberInSurah;
                const isActive = activeAyah === ayah.numberInSurah;

                // Ornamental ayah end marker (mushaf style)
                const AyahMarker = ({ num }: { num: number }) => (
                  <span className="inline-block align-middle mx-1" style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
                    <svg width="30" height="30" viewBox="0 0 100 100" style={{ display: 'inline', verticalAlign: 'middle' }}>
                      <circle cx="50" cy="50" r="46" fill="none" stroke="#b8960c" strokeWidth="3" />
                      <circle cx="50" cy="50" r="38" fill="#f9f0d8" stroke="#b8960c" strokeWidth="1.5" />
                      <text x="50" y="56" textAnchor="middle" dominantBaseline="middle"
                        style={{ fontSize: num > 99 ? '28px' : '32px', fill: '#7a4f00', fontFamily: 'serif', fontWeight: 'bold' }}>
                        {num}
                      </text>
                    </svg>
                  </span>
                );

                // In listen mode: split into clickable words
                if (mode === 'listen') {
                  const wordList = text.split(/\s+/).filter(Boolean);
                  return (
                    <span
                      key={ayah.numberInSurah}
                      data-ayah={ayah.numberInSurah}
                      data-juz={ayah.juz}
                      data-hizb={ayah.hizbQuarter}
                    >
                      {wordList.map((word, wi) => {
                        const wordKey = `${selectedSurah}:${ayah.numberInSurah}:${wi + 1}`;
                        const isWordPlaying = playingWord === wordKey;
                        return (
                          <span
                            key={wi}
                            onClick={() => handleWordClick(ayah.numberInSurah, wi + 1)}
                            className={cn(
                              'cursor-pointer px-0.5 rounded transition-all duration-150',
                              isWordPlaying
                                ? 'bg-amber-500/80 text-white'
                                : 'hover:bg-amber-200/60'
                            )}
                          >
                            {word}{' '}
                          </span>
                        );
                      })}
                      <AyahMarker num={ayah.numberInSurah} />
                    </span>
                  );
                }

                // Normal / tafsir mode
                return (
                  <span
                    key={ayah.numberInSurah}
                    data-ayah={ayah.numberInSurah}
                    data-juz={ayah.juz}
                    data-hizb={ayah.hizbQuarter}
                    onClick={() => handleAyahClick(ayah.numberInSurah)}
                    onDoubleClick={e => toggleMemorized(ayahKey, e)}
                    className={cn(
                      'inline cursor-pointer transition-all duration-200 rounded-sm px-0.5',
                      isActive && mode === 'tafsir' && 'bg-amber-300/40 border-b-2 border-amber-600',
                      isBookmarked && !isActive && 'bg-amber-200/60',
                      isMemorized && 'text-green-800',
                      mode === 'tafsir' && 'hover:bg-amber-100/70',
                      mode === 'normal' && 'hover:bg-amber-100/50'
                    )}
                  >
                    {text}
                    <AyahMarker num={ayah.numberInSurah} />
                  </span>
                );
              })}
            </div>

            {/* Decorative bottom border */}
            <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #b8960c 0%, #d4a843 25%, #f0c040 50%, #d4a843 75%, #b8960c 100%)' }} />
          </div>
        )}
      </div>

      {/* ── Tafsir modal ── */}
      <Dialog.Root
        open={mode === 'tafsir' && !!activeAyah && !!tafsirData}
        onOpenChange={open => { if (!open) setActiveAyah(null); }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed bottom-0 left-0 right-0 max-h-[75vh] bg-card rounded-t-3xl p-6 z-50 overflow-y-auto shadow-2xl" dir="rtl">
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-5" />
            <Dialog.Title className="text-lg font-bold text-primary mb-4">
              تفسير الجلالين — الآية {activeAyah}
            </Dialog.Title>
            <div className="text-lg leading-loose font-serif" dangerouslySetInnerHTML={{ __html: tafsirData?.text ?? 'جاري التحميل...' }} />
            <button onClick={() => setActiveAyah(null)} className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-2xl font-bold">
              إغلاق
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
