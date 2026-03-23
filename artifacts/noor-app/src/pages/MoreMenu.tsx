import { Link } from 'wouter';
import { Compass, Book, Mic, Moon, Sun, ChevronLeft, Zap, LogOut } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

function IslamicPattern() {
  return (
    <svg viewBox="0 0 200 40" className="w-full opacity-15" preserveAspectRatio="xMidYMid meet">
      <g fill="#C19A6B">
        {[20, 60, 100, 140, 180].map((cx, i) => (
          <g key={i}>
            <polygon points={`${cx},5 ${cx+5},17 ${cx+18},17 ${cx+7},25 ${cx+11},38 ${cx},30 ${cx-11},38 ${cx-7},25 ${cx-18},17 ${cx-5},17`} opacity={0.7} />
          </g>
        ))}
        <line x1="0" y1="20" x2="200" y2="20" stroke="#C19A6B" strokeWidth="0.5" opacity="0.5" strokeDasharray="4 8"/>
      </g>
    </svg>
  );
}

export function MoreMenu() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = () => {
    if (confirm('هل تريد تسجيل الخروج وتغيير بياناتك؟')) {
      localStorage.removeItem('user_profile');
      window.location.reload();
    }
  };

  const userProfileRaw = localStorage.getItem('user_profile');
  const userProfile = userProfileRaw ? JSON.parse(userProfileRaw) : null;

  const MENU_ITEMS = [
    { icon: Compass, label: "تحديد القبلة",       path: "/qibla",       color: "text-blue-500",    bg: "bg-blue-500/10",    desc: "اتجاه الكعبة المشرفة" },
    { icon: Book,    label: "أسماء الله الحسنى",  path: "/asma",        color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "99 اسماً مع معانيها" },
    { icon: Mic,     label: "القراء والاستماع",    path: "/reciters",    color: "text-purple-500",  bg: "bg-purple-500/10",  desc: "50+ قارئ للقرآن" },
    { icon: Zap,     label: "قارئ التدبر الذكي",  path: "/speed-reader",color: "text-amber-500",   bg: "bg-amber-500/10",   desc: "Word-by-Word Speed Reader" },
  ];

  return (
    <div className="pb-24 pt-6 px-4 max-w-lg mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>المزيد</h1>

      {/* User profile card */}
      {userProfile && (
        <div className="mb-5 bg-gradient-to-l from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userProfile.photo ? (
              <img src={userProfile.photo} alt={userProfile.name} className="w-10 h-10 rounded-full border-2 border-primary/30" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                  {(userProfile.name ?? '?')[0]}
                </span>
              </div>
            )}
            <div>
              <p className="font-bold text-base" style={{ fontFamily: '"Tajawal", sans-serif' }}>{userProfile.name}</p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>{userProfile.governorateName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 bg-secondary rounded-full text-muted-foreground hover:text-destructive transition-colors" title="تغيير البيانات">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-3">
        {MENU_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.path}
              className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border/50 hover:bg-secondary/50 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-base block" style={{ fontFamily: '"Tajawal", sans-serif' }}>{item.label}</span>
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>{item.desc}</span>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
          );
        })}

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between bg-card p-4 rounded-2xl border border-border/50 hover:bg-secondary/50 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-500/10 text-slate-500 dark:text-slate-300">
              {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </div>
            <div>
              <span className="font-bold text-base block" style={{ fontFamily: '"Tajawal", sans-serif' }}>الوضع الليلي</span>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>{theme === 'dark' ? 'مفعّل' : 'غير مفعّل'}</span>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full relative border border-border transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-secondary'}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${theme === 'dark' ? 'left-0.5' : 'right-0.5'}`} />
          </div>
        </button>
      </div>

      {/* About App Section */}
      <div className="mt-8 bg-card border border-primary/15 rounded-3xl overflow-hidden shadow-sm">
        {/* Decorative top */}
        <div className="bg-gradient-to-l from-primary/10 to-primary/5 px-5 pt-5 pb-3">
          <IslamicPattern />
          <div className="text-center mt-1">
            <p className="text-primary text-4xl" style={{ fontFamily: '"Amiri", "Scheherazade New", serif' }}>نُـور</p>
            <p className="text-muted-foreground text-xs mt-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>الإصدار 2.0 • 2026</p>
          </div>
          <IslamicPattern />
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* App description */}
          <div className="pt-4 border-t border-border/30">
            <h3 className="font-bold text-base text-primary mb-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>عن التطبيق</h3>
            <p className="text-sm text-foreground/80 leading-loose" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              تطبيق <strong>نُور</strong> هو رفيقك الإسلامي الشامل، صُمِّم لمساعدة المسلمين على تعزيز صلتهم بالله وإحياء سنة النبي ﷺ في حياتهم اليومية.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-bold text-sm text-primary mb-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>مميزات التطبيق</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '🕌', text: 'مواقيت الصلاة' },
                { icon: '📖', text: 'القرآن الكريم كاملاً' },
                { icon: '🎙', text: 'أكثر من 50 قارئاً' },
                { icon: '📿', text: 'السبحة الإلكترونية' },
                { icon: '🧭', text: 'تحديد اتجاه القبلة' },
                { icon: '✨', text: 'الأذكار والأدعية' },
                { icon: '📚', text: 'تفسير الجلالين' },
                { icon: '💎', text: 'أسماء الله الحسنى' },
                { icon: '🔔', text: 'إشعارات الأذان' },
                { icon: '🌙', text: 'الوضع الليلي' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-secondary/40 rounded-xl px-3 py-2">
                  <span className="text-base">{f.icon}</span>
                  <span className="text-xs text-foreground/80" style={{ fontFamily: '"Tajawal", sans-serif' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical info */}
          <div className="border-t border-border/30 pt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>مصادر البيانات</span>
              <span className="text-foreground/70 text-left text-[11px]" style={{ fontFamily: '"Tajawal", sans-serif' }}>aladhan.com • alquran.cloud • quran.com</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>الأذان</span>
              <span className="text-foreground/70" style={{ fontFamily: '"Tajawal", sans-serif' }}>islamicfinder.org</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>القراء</span>
              <span className="text-foreground/70" style={{ fontFamily: '"Tajawal", sans-serif' }}>mp3quran.net</span>
            </div>
          </div>

          {/* Developer info */}
          <div className="border-t border-border/30 pt-3 text-center">
            <p className="text-foreground/80 text-sm font-bold" style={{ fontFamily: '"Tajawal", sans-serif' }}>تصميم وتطوير</p>
            <p className="text-primary font-bold text-base mt-0.5" style={{ fontFamily: '"Tajawal", sans-serif' }}>سيف كامل</p>
            <p className="text-muted-foreground text-xs mt-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>مطوّر تطبيقات مسلم — لوجه الله تعالى</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-muted-foreground/40">
              <div className="h-px flex-1 max-w-8" style={{ background: 'rgba(193,154,107,0.3)' }} />
              <svg width="16" height="16" viewBox="0 0 40 40" fill="#C19A6B" opacity={0.4}>
                <polygon points="20,2 24,14 37,14 27,22 31,35 20,27 9,35 13,22 3,14 16,14"/>
              </svg>
              <div className="h-px flex-1 max-w-8" style={{ background: 'rgba(193,154,107,0.3)' }} />
            </div>
            <p className="text-muted-foreground text-xs mt-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>جميع الحقوق محفوظة © 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
