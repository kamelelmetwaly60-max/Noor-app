import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";

import { BottomNav } from "@/components/layout/BottomNav";
import { NotificationsManager } from "@/components/NotificationsManager";
import { MiniPlayer } from "@/components/MiniPlayer";
import { AudioProvider } from "@/contexts/AudioContext";

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

      {/* Full screen routes */}
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

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Apply theme
    document.documentElement.dir = 'rtl';
    const theme = localStorage.getItem('theme');
    if (theme === '"dark"') {
      document.documentElement.classList.add('dark');
    }
    // Check login
    const profile = localStorage.getItem('user_profile');
    setIsLoggedIn(!!profile);
  }, []);

  if (isLoggedIn === null) {
    // Loading splash
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C19A6B]/30 border-t-[#C19A6B] rounded-full animate-spin mx-auto mb-4" />
          <span className="text-[#C19A6B] text-3xl font-serif">نُور</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <QueryClientProvider client={queryClient}>
        <Login onComplete={() => setIsLoggedIn(true)} />
      </QueryClientProvider>
    );
  }

  return (
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
  );
}

export default App;
