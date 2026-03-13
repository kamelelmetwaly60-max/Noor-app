import { Link, useLocation } from "wouter";
import { Home, BookOpen, Heart, Activity, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "home", path: "/", icon: Home, label: "الرئيسية" },
  { id: "quran", path: "/quran", icon: BookOpen, label: "القرآن" },
  { id: "azkar", path: "/azkar", icon: Heart, label: "الأذكار" },
  { id: "tasbih", path: "/tasbih", icon: Activity, label: "التسبيح" },
  { id: "more", path: "/more", icon: Menu, label: "المزيد" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around px-2 h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link key={item.id} href={item.path} className="flex-1 h-full">
              <div
                className={cn(
                  "flex flex-col items-center justify-center h-full gap-1 transition-all duration-300",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all duration-300",
                    isActive ? "bg-primary/10" : "bg-transparent"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      isActive ? "scale-110" : "scale-100"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
