import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuranSurahs, useSurah, useTafsir } from '@/hooks/use-api';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Search, Headphones, FileText, Bookmark, X, ChevronRight } from 'lucide-react';
import { padZero, cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';

export function Quran() {
  const { data: surahs, isLoading: loadingList } = useQuranSurahs();
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const { data: surahData, isLoading: loadingSurah } = useSurah(selectedSurah ?? 0);

  const [mode, setMode] = useState<'normal' | 'sound' | 'tafsir'>('normal');
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [currentJuz, setCurrentJuz] = useState<number | null>(null);
  const [currentHizb, setCurrentHizb] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: tafsirData } = useTafsir(selectedSurah ?? 0, activeAyah ?? 0);

  const [bookmark, setBookmark] = useLocalStorage<{ surah: number; ayah: number } | null>('quran_bookmark', null);
  const [memorized, setMemorized] = useLocalStorage<string[]>('quran_memorized', []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  const handleAyahClick = (ayahNum: number) => {
    if (mode === 'normal') return;

    setActiveAyah(ayahNum);

    if (mode === 'sound' && selectedSurah && audioRef.current) {
      const url = `https://everyayah.com/data/Ahmed_ibn_Ali_al_Ajamy_128kbps/${padZero(selectedSurah, 3)}${padZero(ayahNum, 3)}.mp3`;
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
    }
  };

  const toggleMemorized = (ayahKey: string) => {
    setMemorized(prev =>
      prev.includes(ayahKey) ? prev.filter(k => k !== ayahKey) : [...prev, ayahKey]
    );
  };

  // Track scroll to show current Juz/Hizb
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !surahData) return;
    const container = scrollRef.current;
    const ayahEls = container.querySelectorAll<HTMLElement>('[data-ayah]');
    const containerTop = container.scrollTop;
    let found: HTMLElement | null = null;
    for (const el of ayahEls) {
      if (el.offsetTop - containerTop > -10) {
        found = el;
        break;
      }
    }
    if (found) {
      const juz = found.dataset.juz;
      const hizb = found.dataset.hizb;
      if (juz) setCurrentJuz(parseInt(juz));
      if (hizb) setCurrentHizb(parseFloat(hizb));
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
                سورة {surahs?.find(s => s.number === bookmark.surah)?.name} - الآية {bookmark.ayah}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 pb-4">
          {loadingList ? (
            <div className="text-center py-10 text-primary animate-pulse">جاري تحميل قائمة السور...</div>
          ) : (
            filteredSurahs?.map(s => (
              <button
                key={s.number}
                onClick={() => setSelectedSurah(s.number)}
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

  const hizbDisplay = currentHizb
    ? `الحزب ${Math.ceil(currentHizb / 4)} (ربع ${Math.ceil(currentHizb) % 4 || 4})`
    : '';

  return (
    <div className="h-screen flex flex-col bg-background relative" dir="rtl">
      {/* Header */}
      <div className="px-4 py-3 bg-card border-b border-border shadow-sm flex items-center justify-between z-10">
        <button
          onClick={() => {
            setSelectedSurah(null);
            setActiveAyah(null);
            setMode('normal');
            if (audioRef.current) audioRef.current.pause();
          }}
          className="p-2 bg-secondary rounded-full hover:bg-secondary/80"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center flex-1">
          <h2 className="font-bold text-lg">{surahs?.find(s => s.number === selectedSurah)?.name}</h2>
          {(currentJuz || surahData) && (
            <p className="text-xs text-primary">
              الجزء {currentJuz ?? surahData?.ayahs[0]?.juz}
              {hizbDisplay ? ` • ${hizbDisplay}` : ''}
            </p>
          )}
        </div>
        <div className="w-9" />
      </div>

      {/* Quran Text */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        {loadingSurah ? (
          <div className="text-center py-20 text-primary animate-pulse">جاري تحميل السورة...</div>
        ) : (
          <div className="bg-card rounded-3xl p-6 min-h-full border border-border/30 shadow-sm">
            {selectedSurah !== 1 && selectedSurah !== 9 && (
              <div className="text-center font-serif text-2xl mb-8 text-primary">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}

            <div className="text-justify leading-[3.2rem] text-[1.7rem] font-serif text-foreground">
              {surahData?.ayahs.map((ayah: any) => {
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
                    onDoubleClick={() => mode === 'normal' && toggleMemorized(ayahKey)}
                    className={cn(
                      'inline transition-all duration-200 rounded-sm px-0.5',
                      mode !== 'normal' && 'cursor-pointer hover:bg-primary/10',
                      isActive && mode !== 'normal' && 'bg-primary/20 border-b-2 border-primary',
                      isBookmarked && 'bg-amber-100/60 dark:bg-amber-900/20',
                      isMemorized && 'text-green-700 dark:text-green-400'
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

      {/* Floating action buttons */}
      <div className="absolute bottom-24 left-4 flex flex-col gap-3 z-20">
        <button
          onClick={() => setMode(mode === 'sound' ? 'normal' : 'sound')}
          title="تشغيل الصوت عند الضغط على الآية - أحمد العجمي"
          className={cn(
            'p-4 rounded-full shadow-xl transition-all duration-300 border-2',
            mode === 'sound'
              ? 'bg-primary text-primary-foreground scale-110 border-primary'
              : 'bg-card text-foreground border-border'
          )}
        >
          <Headphones className="w-6 h-6" />
        </button>
        <button
          onClick={() => setMode(mode === 'tafsir' ? 'normal' : 'tafsir')}
          title="عرض تفسير الآية عند الضغط عليها"
          className={cn(
            'p-4 rounded-full shadow-xl transition-all duration-300 border-2',
            mode === 'tafsir'
              ? 'bg-primary text-primary-foreground scale-110 border-primary'
              : 'bg-card text-foreground border-border'
          )}
        >
          <FileText className="w-6 h-6" />
        </button>
        <button
          onClick={() => {
            if (activeAyah && selectedSurah) {
              setBookmark({ surah: selectedSurah, ayah: activeAyah });
            } else if (surahData?.ayahs?.[0] && selectedSurah) {
              setBookmark({ surah: selectedSurah, ayah: 1 });
            }
          }}
          title="حفظ علامة"
          className={cn(
            'p-4 rounded-full shadow-xl transition-all duration-300 border-2',
            bookmark?.surah === selectedSurah ? 'bg-amber-500 text-white border-amber-500' : 'bg-card text-foreground border-border'
          )}
        >
          <Bookmark className="w-6 h-6" />
        </button>
      </div>

      {/* Tafsir modal */}
      <Dialog.Root
        open={mode === 'tafsir' && !!activeAyah && !!tafsirData}
        onOpenChange={() => { setMode('tafsir'); setActiveAyah(null); }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed bottom-0 left-0 right-0 max-h-[75vh] bg-card rounded-t-3xl p-6 z-50 overflow-y-auto animate-in slide-in-from-bottom shadow-2xl" dir="rtl">
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-5" />
            <Dialog.Title className="text-lg font-bold text-primary mb-4">
              تفسير الجلالين - الآية {activeAyah}
            </Dialog.Title>
            <div
              className="text-lg leading-loose font-serif"
              dangerouslySetInnerHTML={{ __html: tafsirData?.text ?? 'جاري التحميل...' }}
            />
            <button
              onClick={() => { setMode('tafsir'); setActiveAyah(null); }}
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
