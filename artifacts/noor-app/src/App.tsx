import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState, useCallback } from "react";
import NotFound from "@/pages/not-found";

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
          try { return JSON.parse(localStorage.getItem('adhan_reciter') ?? '"madinah"'); } catch { return 'madinah'; }
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
          <Login onComplete={() => setIsLoggedIn(true)} />
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
