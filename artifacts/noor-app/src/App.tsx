import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState, useCallback } from "react";
import NotFound from "@/pages/not-found";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function NotifPermDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative bg-card border border-border rounded-3xl p-7 w-full max-w-xs shadow-2xl text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-bold text-xl mb-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>
          يريد تطبيق نُور إرسال إشعارات إليك
        </h3>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed" style={{ fontFamily: '"Tajawal", sans-serif' }}>
          سنُعلمك عند حلول كل وقت صلاة حتى لا تفوتك صلاة واحدة بإذن الله.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl bg-secondary text-foreground font-bold text-sm hover:bg-secondary/80 transition-colors"
            style={{ fontFamily: '"Tajawal", sans-serif' }}
          >
            لاحقاً
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #C19A6B, #a07a4a)',
              color: '#fff',
              fontFamily: '"Tajawal", sans-serif',
              boxShadow: '0 4px 15px rgba(193,154,107,0.35)',
            }}
          >
            السماح
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import { BottomNav } from "@/components/layout/BottomNav";
import { NotificationsManager } from "@/components/NotificationsManager";
import { MiniPlayer } from "@/components/MiniPlayer";
import { AudioProvider } from "@/contexts/AudioContext";
import { SplashScreen } from "@/components/SplashScreen";

import { Login } from "@/pages/Login";
import { Home } from "@/pages/Home";
import { Quran } from "@/pages/Quran";
import { Azkar } from "@/pages/Azkar";
import { Tasbih } from "@/pages/Tasbih";
import { MoreMenu } from "@/pages/MoreMenu";
import { Qibla } from "@/pages/Qibla";
import { Asma } from "@/pages/Asma";
import { Reciters } from "@/pages/Reciters";
import { SpeedReader } from "@/pages/SpeedReader";
import { Adhan } from "@/pages/Adhan";

const queryClient = new QueryClient();

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-primary/30">
      <NotificationsManager />
      {children}
      <MiniPlayer />
      <BottomNav />
    </div>
  );
}

function FullScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-primary/30">
      {children}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <AppShell><Home /></AppShell>
      </Route>
      <Route path="/quran">
        <AppShell><Quran /></AppShell>
      </Route>
      <Route path="/azkar">
        <AppShell><Azkar /></AppShell>
      </Route>
      <Route path="/tasbih">
        <AppShell><Tasbih /></AppShell>
      </Route>
      <Route path="/more">
        <AppShell><MoreMenu /></AppShell>
      </Route>

      <Route path="/qibla">
        <FullScreenShell><Qibla /></FullScreenShell>
      </Route>
      <Route path="/asma">
        <FullScreenShell><Asma /></FullScreenShell>
      </Route>
      <Route path="/reciters">
        <FullScreenShell><Reciters /></FullScreenShell>
      </Route>
      <Route path="/speed-reader">
        <FullScreenShell><SpeedReader /></FullScreenShell>
      </Route>
      <Route path="/adhan">
        <FullScreenShell><Adhan /></FullScreenShell>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showNotifDialog, setShowNotifDialog] = useState(false);

  const handleSplashDone = useCallback(() => {
    setSplashDone(true);
    document.documentElement.dir = 'rtl';
    const theme = localStorage.getItem('theme');
    if (theme === '"dark"') {
      document.documentElement.classList.add('dark');
    }
    const profile = localStorage.getItem('user_profile');
    setIsLoggedIn(!!profile);
  }, []);

  const handleLoginComplete = useCallback(() => {
    setIsLoggedIn(true);
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => setShowNotifDialog(true), 600);
    }
  }, []);

  const handleNotifConfirm = useCallback(async () => {
    setShowNotifDialog(false);
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        const notifPref = (() => {
          try { return JSON.parse(localStorage.getItem('notification_pref') ?? '"adhan"'); } catch { return 'adhan'; }
        })();
        if (notifPref === 'off') {
          localStorage.setItem('notification_pref', JSON.stringify('adhan'));
        }
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    const theme = localStorage.getItem('theme');
    if (theme === '"dark"') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Send prayer data to service worker for background notifications
  useEffect(() => {
    if (!isLoggedIn) return;
    const sendToSW = async () => {
      if (!('serviceWorker' in navigator)) return;
      const reg = await navigator.serviceWorker.getRegistration('/');
      if (!reg?.active) return;
      const profile = (() => {
        try { return JSON.parse(localStorage.getItem('user_profile') ?? '{}'); } catch { return {}; }
      })();
      const { lat, lng } = profile;
      if (!lat || !lng) return;
      const now = new Date();
      const dd = now.getDate().toString().padStart(2, '0');
      const mm = (now.getMonth() + 1).toString().padStart(2, '0');
      const yyyy = now.getFullYear();
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=5`
        );
        const data = await res.json();
        const prayerTimes = data?.data?.timings;
        if (!prayerTimes) return;
        const notifPref = (() => {
          try { return JSON.parse(localStorage.getItem('notification_pref') ?? '"off"'); } catch { return 'off'; }
        })();
        const adhanReciterId = (() => {
          try { return JSON.parse(localStorage.getItem('adhan_reciter') ?? '"azan1"'); } catch { return 'azan1'; }
        })();
        reg.active.postMessage({ type: 'UPDATE_PRAYER_DATA', data: { prayerTimes, notifPref, adhanReciterId } });
      } catch {}
    };
    sendToSW();
    const interval = setInterval(sendToSW, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <>
      <AnimatePresence>
        {showNotifDialog && (
          <NotifPermDialog
            onConfirm={handleNotifConfirm}
            onCancel={() => setShowNotifDialog(false)}
          />
        )}
      </AnimatePresence>

      {!splashDone && <SplashScreen onDone={handleSplashDone} />}

      {splashDone && isLoggedIn === null && (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#C19A6B]/30 border-t-[#C19A6B] rounded-full animate-spin mx-auto mb-4" />
            <span className="text-[#C19A6B] text-3xl" style={{ fontFamily: '"Amiri", serif' }}>نُور</span>
          </div>
        </div>
      )}

      {splashDone && isLoggedIn === false && (
        <QueryClientProvider client={queryClient}>
          <Login onComplete={handleLoginComplete} />
        </QueryClientProvider>
      )}

      {splashDone && isLoggedIn === true && (
        <QueryClientProvider client={queryClient}>
          <AudioProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </AudioProvider>
        </QueryClientProvider>
      )}
    </>
  );
}

export default App;
