import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, ChevronFirst, ChevronLast, Bookmark } from 'lucide-react';
import { Link } from 'wouter';
import { useQuranSurahs, useSurah } from '@/hooks/use-api';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { SURAH_NAMES } from '@/lib/constants';

const TOTAL_QURAN_WORDS = 77430;

interface WordItem {
  word: string;
  ayah: number;
  globalIndex: number;
}

function fmtTime(mins: number): string {
  if (!isFinite(mins) || mins < 0) return '—';
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  if (h > 0) return `${h}س ${m}د`;
  return `${m} دقيقة`;
}

export function SpeedReader() {
  const { data: surahs } = useQuranSurahs();
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [phase, setPhase] = useState<'select' | 'read'>('select');
  const { data: surahData } = useSurah(selectedSurah);

  const [words, setWords] = useState<WordItem[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [wpm, setWpm] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);

  const [savedProgress, setSavedProgress] = useLocalStorage<{ surah: number; wordIndex: number; surahName: string } | null>(
    'speed_reader_progress', null
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build words array from surah data
  useEffect(() => {
    if (!surahData?.ayahs) return;
    const arr: WordItem[] = [];
    let gIdx = 0;
    surahData.ayahs.forEach((ayah: any) => {
      let text = ayah.text as string;
      if (ayah.numberInSurah === 1 && selectedSurah !== 1 && selectedSurah !== 9) {
        text = text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
      }
      const ws = text.split(/\s+/).filter(Boolean);
      ws.forEach(w => {
        arr.push({ word: w, ayah: ayah.numberInSurah, globalIndex: gIdx++ });
      });
    });
    setWords(arr);
    setWordIndex(0);
    setIsPlaying(false);
  }, [surahData, selectedSurah]);

  const startInterval = useCallback((currentWpm: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const ms = Math.round(60000 / currentWpm);
    intervalRef.current = setInterval(() => {
      setWordIndex(prev => {
        if (prev >= words.length - 1) {
          clearInterval(intervalRef.current!);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, ms);
  }, [words.length]);

  useEffect(() => {
    if (isPlaying) {
      startInterval(wpm);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, wpm, startInterval]);

  const handleWpmChange = (newWpm: number) => {
    setWpm(newWpm);
    if (isPlaying) startInterval(newWpm);
  };

  const saveBookmark = () => {
    setSavedProgress({ surah: selectedSurah, wordIndex, surahName: SURAH_NAMES[selectedSurah] ?? '' });
  };

  const currentWord = words[wordIndex];
  const prevWord = words[wordIndex - 1];
  const nextWord = words[wordIndex + 1];

  const wordsRemaining = words.length - wordIndex;
  const minsToFinishSurah = wordsRemaining / wpm;
  const wordsReadGlobal = wordIndex;
  const minsToFinishQuran = (TOTAL_QURAN_WORDS - wordsReadGlobal) / wpm;

  // ── Phase: Surah Selection ──
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-black flex flex-col" dir="rtl">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Link href="/more">
            <button className="p-2 bg-white/10 rounded-full text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg">قارئ التدبر الذكي</h1>
            <p className="text-white/40 text-xs">Word-by-Word Speed Reader</p>
          </div>
        </div>

        {savedProgress && (
          <button
            onClick={() => {
              setSelectedSurah(savedProgress.surah);
              setPhase('read');
              setTimeout(() => setWordIndex(savedProgress.wordIndex), 500);
            }}
            className="mx-4 mt-4 p-4 bg-[#C19A6B]/15 border border-[#C19A6B]/30 rounded-2xl flex items-center gap-3"
          >
            <Bookmark className="w-5 h-5 text-[#C19A6B]" />
            <div className="text-right">
              <p className="text-[#C19A6B] font-bold text-sm">متابعة من آخر توقف</p>
              <p className="text-white/50 text-xs">سورة {savedProgress.surahName} - الكلمة {savedProgress.wordIndex + 1}</p>
            </div>
          </button>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-white/40 text-sm mb-3">اختر سورة للبدء:</p>
          <div className="space-y-2">
            {Array.from({ length: 114 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => { setSelectedSurah(num); setPhase('read'); }}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors text-right ${
                  selectedSurah === num ? 'bg-[#C19A6B]/20 border border-[#C19A6B]/40' : 'bg-white/5 border border-white/5 hover:bg-white/10'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-[#C19A6B]/20 text-[#C19A6B] flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {num}
                </span>
                <span className="text-white font-bold">{SURAH_NAMES[num] ?? `سورة ${num}`}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: Reading ──
  return (
    <div className="min-h-screen bg-black flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={() => { setPhase('select'); setIsPlaying(false); }} className="p-2 bg-white/10 rounded-full text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-white font-bold">سورة {SURAH_NAMES[selectedSurah]}</p>
          <p className="text-white/40 text-xs">آية {currentWord?.ayah ?? 1}</p>
        </div>
        <button onClick={saveBookmark} title="حفظ مكاني">
          <Bookmark className={`w-5 h-5 ${savedProgress?.surah === selectedSurah && savedProgress?.wordIndex === wordIndex ? 'text-[#C19A6B] fill-[#C19A6B]' : 'text-white/40'}`} />
        </button>
      </div>

      {/* Main word display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 select-none">
        {/* Previous word */}
        <div className="h-16 flex items-center opacity-20">
          {prevWord && (
            <span className="text-white font-serif text-2xl">{prevWord.word}</span>
          )}
        </div>

        {/* Current word - glowing */}
        <div className="h-40 flex items-center justify-center">
          {currentWord ? (
            <span
              className="font-serif text-6xl text-[#C19A6B] text-center leading-tight"
              style={{
                textShadow: '0 0 40px rgba(193,154,107,0.6), 0 0 80px rgba(193,154,107,0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              {currentWord.word}
            </span>
          ) : (
            <span className="text-white/20 text-2xl">جاري التحميل...</span>
          )}
        </div>

        {/* Next word */}
        <div className="h-16 flex items-center opacity-20">
          {nextWord && (
            <span className="text-white font-serif text-2xl">{nextWord.word}</span>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-2 grid grid-cols-3 gap-2 border-t border-white/10">
        <div className="text-center">
          <p className="text-white/40 text-[10px]">الكلمة</p>
          <p className="text-white font-bold text-sm">{wordIndex + 1} / {words.length}</p>
        </div>
        <div className="text-center">
          <p className="text-white/40 text-[10px]">باقي للسورة</p>
          <p className="text-[#C19A6B] font-bold text-sm">{fmtTime(minsToFinishSurah)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/40 text-[10px]">باقي للختمة</p>
          <p className="text-white/60 font-bold text-sm">{fmtTime(minsToFinishQuran)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-[#C19A6B] transition-all duration-300"
          style={{ width: words.length ? `${(wordIndex / words.length) * 100}%` : '0%' }}
        />
      </div>

      {/* WPM Slider */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs w-8">20</span>
          <input
            type="range"
            min={20}
            max={500}
            step={10}
            value={wpm}
            onChange={e => handleWpmChange(Number(e.target.value))}
            className="flex-1 accent-[#C19A6B] h-1 rounded-full"
          />
          <span className="text-white/40 text-xs w-8 text-left">500</span>
        </div>
        <p className="text-center text-[#C19A6B] text-sm font-bold mt-1">{wpm} كلمة/دقيقة</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-4 pb-8 pt-2">
        <button
          onClick={() => { setWordIndex(0); if (isPlaying) startInterval(wpm); }}
          className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
        >
          <ChevronFirst className="w-5 h-5" />
        </button>
        <button
          onClick={() => setWordIndex(i => Math.max(0, i - 1))}
          className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
          disabled={wordIndex === 0}
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsPlaying(p => !p)}
          className="w-16 h-16 bg-[#C19A6B] rounded-full flex items-center justify-center shadow-2xl shadow-[#C19A6B]/40 hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause className="w-7 h-7 text-black" /> : <Play className="w-7 h-7 text-black translate-x-0.5" />}
        </button>

        <button
          onClick={() => setWordIndex(i => Math.min(words.length - 1, i + 1))}
          className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
          disabled={wordIndex >= words.length - 1}
        >
          <SkipForward className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setWordIndex(words.length - 1); setIsPlaying(false); }}
          className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
        >
          <ChevronLast className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
