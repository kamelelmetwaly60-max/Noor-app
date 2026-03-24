import { useState, useEffect } from 'react';
import { useReciters } from '@/hooks/use-api';
import { ArrowLeft, Search, ChevronRight } from 'lucide-react';
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

// Country → ISO 2-letter code (lowercase, for flagcdn.com)
const COUNTRY_CODES: Record<string, string> = {
  'مصر': 'eg', 'EG': 'eg', 'Egypt': 'eg',
  'المملكة العربية السعودية': 'sa', 'السعودية': 'sa', 'SA': 'sa', 'Saudi Arabia': 'sa',
  'الكويت': 'kw', 'KW': 'kw', 'Kuwait': 'kw',
  'الإمارات': 'ae', 'الإمارات العربية المتحدة': 'ae', 'AE': 'ae', 'UAE': 'ae',
  'قطر': 'qa', 'QA': 'qa', 'Qatar': 'qa',
  'البحرين': 'bh', 'BH': 'bh', 'Bahrain': 'bh',
  'عمان': 'om', 'OM': 'om', 'Oman': 'om',
  'اليمن': 'ye', 'YE': 'ye', 'Yemen': 'ye',
  'سوريا': 'sy', 'SY': 'sy', 'Syria': 'sy',
  'ليبيا': 'ly', 'LY': 'ly', 'Libya': 'ly',
  'تونس': 'tn', 'TN': 'tn', 'Tunisia': 'tn',
  'الجزائر': 'dz', 'DZ': 'dz', 'Algeria': 'dz',
  'المغرب': 'ma', 'MA': 'ma', 'Morocco': 'ma',
  'السودان': 'sd', 'SD': 'sd', 'Sudan': 'sd',
  'العراق': 'iq', 'IQ': 'iq', 'Iraq': 'iq',
  'الأردن': 'jo', 'JO': 'jo', 'Jordan': 'jo',
  'فلسطين': 'ps', 'PS': 'ps', 'Palestine': 'ps',
  'لبنان': 'lb', 'LB': 'lb', 'Lebanon': 'lb',
  'موريتانيا': 'mr', 'MR': 'mr', 'Mauritania': 'mr',
  'باكستان': 'pk', 'PK': 'pk', 'Pakistan': 'pk',
  'تركيا': 'tr', 'TR': 'tr', 'Turkey': 'tr',
  'ماليزيا': 'my', 'MY': 'my', 'Malaysia': 'my',
  'إندونيسيا': 'id', 'ID': 'id', 'Indonesia': 'id',
  'نيجيريا': 'ng', 'NG': 'ng', 'Nigeria': 'ng',
  'الصومال': 'so', 'SO': 'so', 'Somalia': 'so',
  'غامبيا': 'gm', 'GM': 'gm', 'Gambia': 'gm',
  'السنغال': 'sn', 'SN': 'sn', 'Senegal': 'sn',
  'ليبيريا': 'lr', 'LR': 'lr', 'Liberia': 'lr',
  'غانا': 'gh', 'GH': 'gh', 'Ghana': 'gh',
  'تنزانيا': 'tz', 'TZ': 'tz', 'Tanzania': 'tz',
  'إثيوبيا': 'et', 'ET': 'et', 'Ethiopia': 'et',
  'كندا': 'ca', 'CA': 'ca', 'Canada': 'ca',
  'الولايات المتحدة': 'us', 'US': 'us', 'USA': 'us', 'United States': 'us',
  'بريطانيا': 'gb', 'GB': 'gb', 'United Kingdom': 'gb',
  'فرنسا': 'fr', 'FR': 'fr', 'France': 'fr',
};

// Reciter name → ISO code (for reciters the API doesn't give a country for)
const RECITER_CODES: Record<string, string> = {
  // السعودية
  'عبدالرحمن السديس': 'sa', 'سعود الشريم': 'sa', 'ماهر المعيقلي': 'sa',
  'أحمد العجمي': 'sa', 'أحمد بن علي العجمي': 'sa', 'سعد الغامدي': 'sa',
  'ياسر الدوسري': 'sa', 'أبو بكر الشاطري': 'sa', 'محمد أيوب': 'sa',
  'علي الحذيفي': 'sa', 'إبراهيم الأخضر': 'sa', 'هاني الرفاعي': 'sa',
  'نبيل الرفاعي': 'sa', 'خالد القحطاني': 'sa', 'إبراهيم الجبرين': 'sa',
  'عبدالله عواد الجهني': 'sa', 'بندر بليلة': 'sa', 'صالح الصاهود': 'sa',
  'عبدالله بصفر': 'sa', 'فهد الكندري': 'kw', 'عبدالله البريمي': 'sa',
  'راشد الزهراني': 'sa', 'عمر السبيعي': 'sa', 'أحمد الحواشي': 'sa',
  'أحمد خضر': 'sa', 'حسن سالم': 'sa', 'سعود بن إبراهيم الشريم': 'sa',
  'يوسف الشويعي': 'sa', 'إبراهيم السعدان': 'sa',
  // الكويت
  'مشاري العفاسي': 'kw', 'مشاري بن راشد العفاسي': 'kw', 'ناصر القطامي': 'kw',
  'عبدالعزيز الأحمد': 'kw', 'عبدالله الكندري': 'kw',
  // مصر
  'محمود خليل الحصري': 'eg', 'محمد صديق المنشاوي': 'eg', 'عبدالباسط عبدالصمد': 'eg',
  'محمد الطبلاوي': 'eg', 'عادل ريان': 'eg', 'أيمن سويد': 'eg',
  'محمد جبريل': 'eg', 'خالد عبدالكافي': 'eg', 'ممدوح بيومي': 'eg',
  'محمد محمود الطبلاوي': 'eg', 'محمد إسماعيل': 'eg', 'أحمد الدباوي': 'eg',
  'توفيق إبراهيم': 'eg', 'إسلام صبحي': 'eg',
  // الإمارات
  'خليفة الطنيجي': 'ae',
  // المغرب
  'عمر القزابري': 'ma', 'مصطفى اللاهوني': 'ma', 'تميم الزبيدي': 'ma',
  'سعيد الكملي': 'ma', 'إدريس أبكر': 'ma', 'يوسف الشاهدي': 'ma',
  // الجزائر
  'فارس عباد': 'dz',
  // تونس
  'يحيى حواء': 'tn',
  // اليمن
  'وديع اليمني': 'ye', 'أكرم العلاقمي': 'ye',
  // لبنان
  'توفيق الصايغ': 'lb',
  // ليبيا
  'خالد المهنا': 'ly',
  // العراق
  'جاسم المطوع': 'kw',
  // الأردن
  'خليل الحصري': 'eg',
};

function getCountryCode(country?: string, name?: string): string | null {
  if (country) {
    const code = COUNTRY_CODES[country] ?? COUNTRY_CODES[country.trim()];
    if (code) return code;
  }
  if (name) {
    const code = RECITER_CODES[name] ?? RECITER_CODES[name.trim()];
    if (code) return code;
    for (const [key, c] of Object.entries(RECITER_CODES)) {
      if (name.includes(key) || key.includes(name.split(' ')[0])) return c;
    }
  }
  return null;
}

function FlagImg({ code, className = '', style = {} }: { code: string | null; className?: string; style?: React.CSSProperties }) {
  if (!code) {
    return (
      <div className={`flex items-center justify-center bg-primary/10 ${className}`} style={style}>
        <span className="text-xl">🌍</span>
      </div>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      srcSet={`https://flagcdn.com/w160/${code}.png 2x`}
      alt={code}
      className={`object-cover ${className}`}
      style={style}
      onError={e => {
        const el = e.currentTarget.parentElement;
        if (el) el.innerHTML = '<span style="font-size:1.25rem">🌍</span>';
      }}
    />
  );
}

// Beautiful Islamic geometric disc for the player
function IslamicDisc({ isPlaying }: { isPlaying?: boolean }) {
  const star8 = Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 === 0 ? 62 : 36;
    const angle = (i * 22.5 - 90) * Math.PI / 180;
    return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
  }).join(' ');

  const star12 = Array.from({ length: 24 }, (_, i) => {
    const r = i % 2 === 0 ? 80 : 72;
    const angle = (i * 15 - 90) * Math.PI / 180;
    return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={isPlaying ? { animation: 'spin 12s linear infinite' } : {}}
    >
      <defs>
        <radialGradient id="discGrad" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#2e2008" />
          <stop offset="100%" stopColor="#0f0a03" />
        </radialGradient>
      </defs>

      {/* Background */}
      <circle cx="100" cy="100" r="100" fill="url(#discGrad)" />

      {/* Outer rings */}
      <circle cx="100" cy="100" r="97" fill="none" stroke="#C19A6B" strokeWidth="1.5" opacity="0.4" />
      <circle cx="100" cy="100" r="90" fill="none" stroke="#C19A6B" strokeWidth="0.5" opacity="0.2" />

      {/* 24 tick marks on outer band */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i * 15 - 90) * Math.PI / 180;
        const long = i % 6 === 0;
        const r1 = 90, r2 = long ? 97 : 94;
        return (
          <line key={i}
            x1={100 + r1 * Math.cos(angle)} y1={100 + r1 * Math.sin(angle)}
            x2={100 + r2 * Math.cos(angle)} y2={100 + r2 * Math.sin(angle)}
            stroke="#C19A6B" strokeWidth={long ? 2 : 1} opacity={long ? 0.7 : 0.35}
            strokeLinecap="round"
          />
        );
      })}

      {/* 12-point outer star */}
      <polygon points={star12} fill="rgba(193,154,107,0.07)" stroke="#C19A6B" strokeWidth="1" opacity="0.4" />

      {/* Two overlapping squares (Islamic geometric base) */}
      <rect x="37" y="37" width="126" height="126" transform="rotate(0,100,100)"
        fill="none" stroke="#C19A6B" strokeWidth="0.7" opacity="0.18" />
      <rect x="37" y="37" width="126" height="126" transform="rotate(45,100,100)"
        fill="none" stroke="#C19A6B" strokeWidth="0.7" opacity="0.18" />

      {/* 8-pointed star fill */}
      <polygon points={star8} fill="rgba(193,154,107,0.12)" stroke="#C19A6B" strokeWidth="1.5" opacity="0.8" />

      {/* Dots at 8 star outer points */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45 - 90) * Math.PI / 180;
        return (
          <circle key={i}
            cx={100 + 62 * Math.cos(angle)} cy={100 + 62 * Math.sin(angle)}
            r="3.5" fill="#C19A6B" opacity="0.7"
          />
        );
      })}

      {/* 4 lines crossing (Islamic cross pattern) */}
      {[0, 45, 90, 135].map(deg => {
        const a = deg * Math.PI / 180;
        return (
          <line key={deg}
            x1={100 + 36 * Math.cos(a)} y1={100 + 36 * Math.sin(a)}
            x2={100 - 36 * Math.cos(a)} y2={100 - 36 * Math.sin(a)}
            stroke="#C19A6B" strokeWidth="0.5" opacity="0.2"
          />
        );
      })}

      {/* Inner circle with glow */}
      <circle cx="100" cy="100" r="30" fill="rgba(193,154,107,0.15)" stroke="#C19A6B" strokeWidth="1.5" opacity="0.8" />
      <circle cx="100" cy="100" r="22" fill="rgba(193,154,107,0.08)" stroke="#C19A6B" strokeWidth="1" opacity="0.5" />

      {/* Arabesque petals (8 small arcs around center) */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45 - 90) * Math.PI / 180;
        const cx2 = 100 + 22 * Math.cos(angle);
        const cy2 = 100 + 22 * Math.sin(angle);
        return (
          <ellipse key={i} cx={cx2} cy={cy2} rx="5" ry="8"
            transform={`rotate(${i * 45}, ${cx2}, ${cy2})`}
            fill="rgba(193,154,107,0.2)" stroke="#C19A6B" strokeWidth="0.7" opacity="0.6"
          />
        );
      })}

      {/* "ق" in Arabic at center */}
      <text x="100" y="107" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: '"Amiri Quran", "Amiri", serif', fontSize: '24px', fill: '#d4b483', fontWeight: 'bold' }}>
        ق
      </text>

      {/* Center dot */}
      <circle cx="100" cy="100" r="5" fill="#C19A6B" opacity="0.9" />
    </svg>
  );
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
  const [selectedReciter, setSelectedReciter] = useState<{
    id: string; name: string; server: string; moshafName: string; country?: string;
  } | null>(null);

  // On mount: if audio is already playing, jump straight to player
  useEffect(() => {
    if (audio.surahNum && audio.reciterId && audio.reciterName && audio.serverUrl) {
      setSelectedReciter({
        id: audio.reciterId,
        name: audio.reciterName,
        server: audio.serverUrl,
        moshafName: '',
        country: undefined,
      });
      setPhase('player');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    audio.play({ reciterId: selectedReciter.id, reciterName: selectedReciter.name, serverUrl: selectedReciter.server, surahNum, surahName });
    setPhase('player');
  };

  // ── PHASE: Reciters ──────────────────────────────────────────────────────
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
                  const code = getCountryCode(r.country, r.name);
                  return (
                    <button
                      key={`${r.id}-${mi}`}
                      onClick={() => selectReciter(r, moshaf)}
                      className="w-full bg-card hover:bg-secondary/50 p-4 rounded-2xl border border-border shadow-sm flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3 text-right">
                        {/* Real flag avatar — circular, clipped */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-border bg-primary/10 flex items-center justify-center">
                          <FlagImg
                            code={code}
                            className="w-full h-full"
                            style={{ objectPosition: 'center' }}
                          />
                        </div>
                        <div>
                          <p className="font-bold" style={{ fontFamily: '"Tajawal", sans-serif' }}>{r.name}</p>
                          <p className="text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                            {moshaf.name}
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

  // ── PHASE: Surahs ────────────────────────────────────────────────────────
  if (phase === 'surahs') {
    const code = getCountryCode(selectedReciter?.country, selectedReciter?.name);
    return (
      <div className="h-screen flex flex-col max-w-lg mx-auto bg-background" dir="rtl">
        <div className="px-4 py-4 flex items-center gap-4 bg-card shadow-sm border-b border-border flex-shrink-0">
          <button onClick={() => setPhase('reciters')} className="p-2 bg-secondary rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            {/* Round flag */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-border">
              <FlagImg code={code} className="w-full h-full" style={{ objectPosition: 'center' }} />
            </div>
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
                  'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-right',
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
                    {[1, 2, 3].map(b => (
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

  // ── PHASE: Full Player ────────────────────────────────────────────────────
  const progress = audio.duration ? audio.currentTime / audio.duration : 0;
  const code = getCountryCode(selectedReciter?.country, selectedReciter?.name);

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #0d0b07 0%, #1a1308 50%, #0d0b07 100%)' }}>

      {/* Spin animation keyframes */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={() => setPhase('surahs')} className="p-2 rounded-full" style={{ background: 'rgba(193,154,107,0.15)', border: '1px solid rgba(193,154,107,0.25)' }}>
          <ArrowLeft className="w-5 h-5" style={{ color: '#C19A6B' }} />
        </button>
        <p className="text-sm font-bold" style={{ color: 'rgba(193,154,107,0.7)', fontFamily: '"Tajawal", sans-serif' }}>قيد التشغيل</p>
        <div className="w-9" />
      </div>

      {/* Islamic Geometric Disc */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        <div className="relative" style={{ width: 220, height: 220 }}>
          <div className="w-full h-full rounded-full overflow-hidden" style={{ boxShadow: '0 8px 50px rgba(193,154,107,0.35), 0 0 0 2px rgba(193,154,107,0.2)' }}>
            <IslamicDisc isPlaying={audio.isPlaying} />
          </div>
          {/* Reflection glow */}
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse at 35% 25%, rgba(193,154,107,0.08) 0%, transparent 60%)' }} />
        </div>

        {/* Reciter info with real flag */}
        <div className="text-center w-full">
          <h2 className="text-2xl font-bold" style={{ fontFamily: '"Amiri", serif', color: '#e8d9b8' }}>سورة {audio.surahName}</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-6 h-4 rounded overflow-hidden border border-white/10 flex-shrink-0">
              <FlagImg code={code} className="w-full h-full" style={{ objectPosition: 'center' }} />
            </div>
            <p style={{ fontFamily: '"Tajawal", sans-serif', color: 'rgba(193,154,107,0.7)' }}>{audio.reciterName}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-16">
        {/* ── Progress bar (RTL: fills right → left) ── */}
        <div
          className="w-full h-2 rounded-full mb-2 cursor-pointer relative overflow-hidden"
          style={{ background: 'rgba(193,154,107,0.15)' }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            // RTL: right side = 0%, left side = 100%
            audio.seek(1 - (e.clientX - rect.left) / rect.width);
          }}
        >
          {/* Filled bar anchored to right, grows left */}
          <div
            className="absolute top-0 right-0 h-full rounded-full transition-all duration-300 relative"
            style={{ width: `${progress * 100}%`, background: 'linear-gradient(to left, #C19A6B, #8a6a3a)' }}
          >
            {/* Thumb dot on left edge of filled bar */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-md"
              style={{ background: '#C19A6B', boxShadow: '0 0 8px rgba(193,154,107,0.6)' }}
            />
          </div>
        </div>

        {/* Time labels — RTL: currentTime on RIGHT (start), duration on LEFT (end) */}
        <div className="flex justify-between text-xs mb-6" style={{ color: 'rgba(193,154,107,0.5)', fontFamily: '"Tajawal", sans-serif' }}>
          <span>{fmtTime(audio.duration)}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtTime(audio.currentTime)}</span>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between">
          {/* Previous surah */}
          <button
            onClick={() => { if (audio.surahNum && audio.surahNum > 1) { const n = audio.surahNum - 1; audio.play({ reciterId: audio.reciterId, reciterName: audio.reciterName, serverUrl: audio.serverUrl, surahNum: n, surahName: SURAH_NAMES[n] ?? '' }); } }}
            className="p-4 rounded-full transition-all"
            style={{ background: 'rgba(193,154,107,0.12)', border: '1px solid rgba(193,154,107,0.2)' }}
            disabled={!audio.surahNum || audio.surahNum <= 1}
          >
            <svg viewBox="0 0 24 24" fill="#C19A6B" className="w-6 h-6"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={audio.togglePlay}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #C19A6B, #7a5020)', boxShadow: '0 0 30px rgba(193,154,107,0.4)' }}
          >
            {audio.isLoading ? (
              <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : audio.isPlaying ? (
              <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 translate-x-0.5"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {/* Next surah */}
          <button
            onClick={() => { if (audio.surahNum && audio.surahNum < 114) { const n = audio.surahNum + 1; audio.play({ reciterId: audio.reciterId, reciterName: audio.reciterName, serverUrl: audio.serverUrl, surahNum: n, surahName: SURAH_NAMES[n] ?? '' }); } }}
            className="p-4 rounded-full transition-all"
            style={{ background: 'rgba(193,154,107,0.12)', border: '1px solid rgba(193,154,107,0.2)' }}
            disabled={!audio.surahNum || audio.surahNum >= 114}
          >
            <svg viewBox="0 0 24 24" fill="#C19A6B" className="w-6 h-6"><path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 4V8l-5.5 4zM16 6h2v12h-2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
