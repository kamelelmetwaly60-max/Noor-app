import { useState } from 'react';
import { MORNING_AZKAR, EVENING_AZKAR } from '@/lib/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getTodayKey, cn } from '@/lib/utils';
import { Check, RotateCcw, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AzkarItem = { id: string; text: string; count: number; source: string };

export function Azkar() {
  const [tab, setTab] = useState<'morning' | 'evening'>('morning');
  const todayKey = getTodayKey();
  const [progress, setProgress] = useLocalStorage<Record<string, number>>(`azkar_${todayKey}`, {});

  const azkarList: AzkarItem[] = tab === 'morning' ? MORNING_AZKAR : EVENING_AZKAR;

  const totalDone = azkarList.filter(z => (progress[z.id] ?? 0) >= z.count).length;
  const allDone = totalDone === azkarList.length;

  const handleTap = (id: string, max: number) => {
    setProgress(prev => {
      const current = prev[id] ?? 0;
      if (current >= max) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };

  const resetToday = () => {
    if (confirm('هل تريد تصفير الأذكار لليوم؟')) {
      setProgress({});
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-lg mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">الأذكار</h1>
        <button onClick={resetToday} className="p-2 bg-secondary text-primary rounded-full hover:bg-primary/20 transition-colors" title="تصفير اليوم">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Progress summary */}
      <div className="mb-5 bg-card rounded-2xl p-3 border border-border/50 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {totalDone} / {azkarList.length} ذكر مكتمل
        </span>
        {allDone && (
          <span className="text-green-600 text-sm font-bold flex items-center gap-1">
            <Check className="w-4 h-4" />
            أحسنت! أكملت الأذكار
          </span>
        )}
      </div>

      <div className="flex bg-secondary/50 rounded-2xl p-1 mb-6 border border-border/50">
        <button
          onClick={() => setTab('morning')}
          className={cn(
            'flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm',
            tab === 'morning' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
          )}
        >
          <Sun className="w-4 h-4" /> أذكار الصباح
        </button>
        <button
          onClick={() => setTab('evening')}
          className={cn(
            'flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm',
            tab === 'evening' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
          )}
        >
          <Moon className="w-4 h-4" /> أذكار المساء
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {azkarList.map((zekr, index) => {
            const current = progress[zekr.id] ?? 0;
            const isDone = current >= zekr.count;

            return (
              <motion.div
                key={`${tab}-${zekr.id}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                className={cn(
                  'bg-card border-2 rounded-3xl p-5 shadow-sm transition-all duration-500',
                  isDone ? 'border-green-500/50 bg-green-50/30 dark:bg-green-900/10' : 'border-border/50'
                )}
              >
                <p className="text-lg leading-loose font-serif mb-2 whitespace-pre-wrap">{zekr.text}</p>
                <p className="text-xs text-primary/70 mb-4 bg-primary/5 inline-block px-2 py-0.5 rounded-lg">{zekr.source}</p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {isDone ? (
                      <span className="text-green-600 font-bold">✓ مكتمل</span>
                    ) : (
                      <span>متبقي: <strong>{zekr.count - current}</strong> / {zekr.count}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleTap(zekr.id, zekr.count)}
                    disabled={isDone}
                    className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 shadow-md',
                      isDone
                        ? 'bg-green-500 text-white scale-110 shadow-green-500/30 cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 cursor-pointer'
                    )}
                  >
                    {isDone ? <Check className="w-8 h-8" /> : (zekr.count - current)}
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-secondary h-1.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500 rounded-full',
                      isDone ? 'bg-green-500' : 'bg-primary'
                    )}
                    style={{ width: `${Math.min((current / zekr.count) * 100, 100)}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
