import { Link } from 'wouter';
import { Compass, Book, Mic, Moon, Sun, ChevronLeft, Zap, LogOut } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

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
      <h1 className="text-2xl font-bold mb-2">المزيد</h1>

      {/* User profile card */}
      {userProfile && (
        <div className="mb-5 bg-gradient-to-l from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-base">{userProfile.name}</p>
            <p className="text-xs text-muted-foreground">{userProfile.governorateName}</p>
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
                  <span className="font-bold text-base block">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
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
              <span className="font-bold text-base block">الوضع الليلي</span>
              <span className="text-xs text-muted-foreground">{theme === 'dark' ? 'مفعّل' : 'غير مفعّل'}</span>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full relative border border-border transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-secondary'}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${theme === 'dark' ? 'left-0.5' : 'right-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Credits */}
      <div className="mt-10 text-center space-y-1">
        <p className="text-primary/80 font-serif text-2xl">نُور</p>
        <p className="text-muted-foreground text-sm">تطبيق إسلامي شامل</p>
        <div className="pt-2 border-t border-border/30 mt-3">
          <p className="text-foreground/60 text-sm font-bold">تصميم وتطوير: سيف كامل</p>
          <p className="text-muted-foreground text-xs mt-0.5">جميع الحقوق محفوظة © 2025</p>
        </div>
      </div>
    </div>
  );
}
