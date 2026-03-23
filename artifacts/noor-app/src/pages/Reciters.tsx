import { useState } from 'react';
import { useReciters } from '@/hooks/use-api';
import { ArrowLeft, Search, ChevronRight, Music } from 'lucide-react';
import { Link } from 'wouter';
import { useAudio } from '@/contexts/AudioContext';
import { SURAH_NAMES } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Phase = 'reciters' | 'surahs' | 'player';

const SURAH_AYAHS: Record<number, number> = {
  1:7,2:286,3:200,4:176,5:120,6:165,7:206,8:75,9:129,10:109,11:123,12:111,13:43,14:52,15:99,
  16:128,17:111,18:110,19:98,20:135,21:112,22:78,23:118,24:64,25:77,26:227,27:93,28:88,29:69,
  30:60,31:34,32:30,33:73,34:54,35:45,36:83,37:182,38:88,39:75,40:85,41:54,42:53,43:89,44:59,
  45:37,46:35,47:38,48:29,49:18,50:45,51:60,52:49,53:62,54:55,55:78,56:96,57:29,58:22,59:24,
  60:13,61:14,62:11,63:11,64:18,65:12,66:12,67:30,68:52,69:52,70:44,71:28,72:28,73:20,74:56,
  75:40,76:31,77:50,78:40,79:46,80:42,81:29,82:19,83:36,84:25,85:22,86:17,87:19,88:26,89:30,
  90:20,91:15,92:21,93:11,94:8,95:8,96:19,97:5,98:8,99:8,100:11,101:11,102:8,103:3,104:9,
  105:5,106:4,107:7,108:3,109:6,110:3,111:5,112:4,113:5,114:6,
};

// Country flag map - maps country names to flag emojis
const COUNTRY_FLAGS: Record<string, string> = {
  'مصر': '🇪🇬',
  'المملكة العربية السعودية': '🇸🇦',
  'السعودية': '🇸🇦',
  'الكويت': '🇰🇼',
  'الإمارات': '🇦🇪',
  'الإمارات العربية المتحدة': '🇦🇪',
  'قطر': '🇶🇦',
  'البحرين': '🇧🇭',
  'عمان': '🇴🇲',
  'اليمن': '🇾🇪',
  'سوريا': '🇸🇾',
  'ليبيا': '🇱🇾',
  'تونس': '🇹🇳',
  'الجزائر': '🇩🇿',
  'المغرب': '🇲🇦',
  'السودان': '🇸🇩',
  'العراق': '🇮🇶',
  'الأردن': '🇯🇴',
  'فلسطين': '🇵🇸',
  'لبنان': '🇱🇧',
  'موريتانيا': '🇲🇷',
  'باكستان': '🇵🇰',
  'تركيا': '🇹🇷',
  'ماليزيا': '🇲🇾',
  'إندونيسيا': '🇮🇩',
  'Nigeria': '🇳🇬',
};

function getFlag(country?: string): string {
  if (!country) return '🕌';
  return COUNTRY_FLAGS[country] ?? COUNTRY_FLAGS[country.trim()] ?? '🌍';
}

function fmtTime(s: number) {
  if (!s || isNaN(s) || !isFinite(s)) return '0:00';
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

export function Reciters() {
  const { data: reciters, isLoading } = useReciters();
  const audio = useAudio();

  const [search, setSearch] = useState('');
  const [phase, setPhase] = useState<Phase>('reciters');
  const [selectedReciter, setSelectedReciter] = useState<{ id: string; name: string; server: string; moshafName: string; country?: string } | null>(null);

  const filtered = reciters?.filter((r: any) =>
    r.name.includes(search) || r.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectReciter = (r: any, moshaf: any) => {
    setSelectedReciter({ id: r.id, name: r.name, server: moshaf.server, moshafName: moshaf.name, country: r.country });
    setPhase('surahs');
  };

  const playSurah = (surahNum: number) => {
    if (!selectedReciter) return;
    const surahName = SURAH_NAMES[surahNum] ?? `سورة ${surahNum}`;
    audio.play({
      reciterId: selectedReciter.id,
      reciterName: selectedReciter.name,
      serverUrl: selectedReciter.server,
      surahNum,
      surahName,
    });
    setPhase('player');
  };

  // ── PHASE: Reciters ──
  if (phase === 'reciters') {
    return (
      <div className="h-screen flex flex-col max-w-lg mx-auto bg-background" dir="rtl">
        <div className="px-4 py-4 flex items-center gap-4 bg-card shadow-sm border-b border-border flex-shrink-0">
          <Link href="/more">
            <button className="p-2 bg-secondary rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-xl" style={{ fontFamily: '"Tajawal", sans-serif' }}>القراء والاستماع</h1>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>{reciters?.length ?? 0} قارئ</p>
          </div>
        </div>

        <div className="p-4 border-b border-border bg-card flex-shrink-0">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن قارئ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-secondary border border-border rounded-2xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              style={{ fontFamily: '"Tajawal", sans-serif' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <p className="text-muted-foreground font-bold" style={{ fontFamily: '"Tajawal", sans-serif' }}>جاري تحميل القراء...</p>
            </div>
          ) : (
            <div className="space-y-2 pb-6">
              {filtered?.map((r: any) =>
                (r.moshaf ?? []).filter((m: any) => !!m.server).map((moshaf: any, mi: number) => {
                  const flag = getFlag(r.country);
                  return (
                    <button
                      key={`${r.id}-${mi}`}
                      onClick={() => selectReciter(r, moshaf)}
                      className="w-full bg-card hover:bg-secondary/50 p-4 rounded-2xl border border-border shadow-sm flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3 text-right">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                          <Music className="w-5 h-5 text-primary" />
                          {/* Country flag badge */}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-xs shadow-sm">
                            {flag}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold" style={{ fontFamily: '"Tajawal", sans-serif' }}>{r.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                            {r.country && <span>{flag} {r.country}</span>}
                            {r.country && moshaf.name && <span className="opacity-40">•</span>}
                            <span>{moshaf.name}</span>
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground rotate-180" />
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── PHASE: Surahs ──
  if (phase === 'surahs') {
    const flag = getFlag(selectedReciter?.country);
    return (
      <div className="h-screen flex flex-col max-w-lg mx-auto bg-background" dir="rtl">
        <div className="px-4 py-4 flex items-center gap-4 bg-card shadow-sm border-b border-border flex-shrink-0">
          <button onClick={() => setPhase('reciters')} className="p-2 bg-secondary rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{flag}</span>
            <div>
              <h1 className="font-bold text-lg leading-tight" style={{ fontFamily: '"Tajawal", sans-serif' }}>{selectedReciter?.name}</h1>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>{selectedReciter?.moshafName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2 pb-6">
            {Array.from({ length: 114 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => playSurah(num)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-right",
                  audio.surahNum === num && audio.reciterId === selectedReciter?.id
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-card border-border hover:bg-secondary/50'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                  {num}
                </div>
                <div className="flex-1">
                  <p className="font-bold" style={{ fontFamily: '"Amiri", serif' }}>{SURAH_NAMES[num]}</p>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>{SURAH_AYAHS[num] ?? '?'} آية</p>
                </div>
                {audio.surahNum === num && audio.reciterId === selectedReciter?.id && (
                  <div className="flex gap-0.5">
                    {[1,2,3].map(b => (
                      <div key={b} className="w-1 bg-primary rounded-full animate-bounce" style={{ height: `${8 + b * 4}px`, animationDelay: `${b * 0.1}s` }} />
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: Full Player ──
  const progress = audio.duration ? audio.currentTime / audio.duration : 0;
  const flag = getFlag(selectedReciter?.country);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/30 to-background max-w-lg mx-auto" dir="rtl">
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={() => setPhase('surahs')} className="p-2 bg-black/10 rounded-full text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="text-sm font-bold text-foreground/70" style={{ fontFamily: '"Tajawal", sans-serif' }}>قيد التشغيل</p>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        <div className="w-64 h-64 bg-gradient-to-br from-primary to-primary/50 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30">
          <span className="text-white text-8xl" style={{ fontFamily: '"Amiri", serif' }}>ق</span>
        </div>

        <div className="text-center w-full">
          <h2 className="text-2xl font-bold" style={{ fontFamily: '"Amiri", serif' }}>سورة {audio.surahName}</h2>
          <p className="text-muted-foreground mt-1 flex items-center justify-center gap-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            <span>{flag}</span>
            <span>{audio.reciterName}</span>
          </p>
        </div>
      </div>

      <div className="px-6 pb-16">
        <div
          className="w-full h-1.5 bg-secondary rounded-full mb-2 cursor-pointer"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            audio.seek((e.clientX - rect.left) / rect.width);
          }}
        >
          <div className="h-full bg-primary rounded-full relative transition-all" style={{ width: `${progress * 100}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-md" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mb-6">
          <span style={{ fontFamily: '"Tajawal", sans-serif' }}>{fmtTime(audio.currentTime)}</span>
          <span style={{ fontFamily: '"Tajawal", sans-serif' }}>{fmtTime(audio.duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => { if (audio.surahNum && audio.surahNum > 1) { const n = audio.surahNum - 1; audio.play({ reciterId: audio.reciterId, reciterName: audio.reciterName, serverUrl: audio.serverUrl, surahNum: n, surahName: SURAH_NAMES[n] ?? '' }); } }}
            className="p-4 bg-secondary rounded-full text-foreground"
            disabled={!audio.surahNum || audio.surahNum <= 1}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
          </button>

          <button
            onClick={audio.togglePlay}
            className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl shadow-primary/30 hover:scale-105 transition-transform"
          >
            {audio.isLoading ? (
              <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : audio.isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 translate-x-0.5"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          <button
            onClick={() => { if (audio.surahNum && audio.surahNum < 114) { const n = audio.surahNum + 1; audio.play({ reciterId: audio.reciterId, reciterName: audio.reciterName, serverUrl: audio.serverUrl, surahNum: n, surahName: SURAH_NAMES[n] ?? '' }); } }}
            className="p-4 bg-secondary rounded-full text-foreground"
            disabled={!audio.surahNum || audio.surahNum >= 114}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 4V8l-5.5 4zM16 6h2v12h-2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
