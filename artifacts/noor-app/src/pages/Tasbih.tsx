import { useLocalStorage } from '@/hooks/use-local-storage';
import { TASBIH_TYPES } from '@/lib/constants';
import { RotateCcw, BarChart2 } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useState } from 'react';

const BEAD_COUNT = 33;

function BeadsSVG({ count, limit }: { count: number; limit: number }) {
  const beadsToShow = Math.min(BEAD_COUNT, limit);
  const filled = count % beadsToShow;
  const rounds = Math.floor(count / beadsToShow);
  const cx = 130, cy = 140, rx = 110, ry = 110;

  const beads = Array.from({ length: beadsToShow }, (_, i) => {
    const angle = (i / beadsToShow) * 2 * Math.PI - Math.PI / 2;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    const isFilled = i < filled || (filled === 0 && count > 0 && rounds > 0);
    return { x, y, filled: isFilled };
  });

  return (
    <svg viewBox="0 0 260 280" className="w-64 h-64">
      {/* Chain */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
      {/* Beads */}
      {beads.map((b, i) => (
        <g key={i}>
          <circle
            cx={b.x}
            cy={b.y}
            r={i % 10 === 0 ? 8 : 6}
            fill={b.filled ? 'hsl(var(--primary))' : 'hsl(var(--card))'}
            stroke={b.filled ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
            strokeWidth="1.5"
          />
          {i % 10 === 0 && (
            <circle cx={b.x} cy={b.y} r={3} fill={b.filled ? 'white' : 'hsl(var(--muted-foreground))'} opacity={0.5} />
          )}
        </g>
      ))}
      {/* Top tassel */}
      <rect x={cx - 2} y={10} width={4} height={18} rx={2} fill="hsl(var(--primary))" />
      <circle cx={cx} cy={9} r={5} fill="hsl(var(--primary))" />
      {/* Rounds badge */}
      {rounds > 0 && (
        <g>
          <circle cx={cx} cy={cy} r={22} fill="hsl(var(--primary))" opacity={0.15} />
          <text x={cx} y={cy + 6} textAnchor="middle" fontSize="14" fontWeight="bold"
            fill="hsl(var(--primary))" fontFamily="serif">
            ×{rounds}
          </text>
        </g>
      )}
    </svg>
  );
}

export function Tasbih() {
  const [typeIndex, setTypeIndex] = useLocalStorage('tasbih_type_idx', 0);
  const [totals, setTotals] = useLocalStorage<Record<string, number>>('tasbih_totals', {});
  const [counts, setCounts] = useLocalStorage<Record<string, number>>('tasbih_counts', {});
  const [showStats, setShowStats] = useState(false);

  const controls = useAnimation();
  const [isPressing, setIsPressing] = useState(false);

  const currentType = TASBIH_TYPES[typeIndex];
  const count = counts[currentType.id] ?? 0;
  const total = totals[currentType.id] ?? 0;

  const handleTap = () => {
    if ('vibrate' in navigator) navigator.vibrate(15);
    controls.start({ scale: [1, 0.94, 1], transition: { duration: 0.18 } });
    setCounts(prev => ({ ...prev, [currentType.id]: (prev[currentType.id] ?? 0) + 1 }));
    setTotals(prev => ({ ...prev, [currentType.id]: (prev[currentType.id] ?? 0) + 1 }));
  };

  const handleReset = () => {
    if (confirm('تصفير عداد هذا التسبيح؟')) {
      setCounts(prev => ({ ...prev, [currentType.id]: 0 }));
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 h-screen flex flex-col max-w-lg mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">السبحة الإلكترونية</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowStats(!showStats)} className="p-2 bg-secondary text-primary rounded-full">
            <BarChart2 className="w-5 h-5" />
          </button>
          <button onClick={handleReset} className="p-2 bg-secondary text-primary rounded-full">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-3 animate-in slide-in-from-top-2">
          <h3 className="font-bold mb-3 text-sm text-primary">المجموع الكلي لكل تسبيح</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {TASBIH_TYPES.filter(t => (totals[t.id] ?? 0) > 0).map(t => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="font-serif text-foreground/80 text-xs truncate flex-1 ml-2">{t.text}</span>
                <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full text-xs">{totals[t.id]?.toLocaleString('ar-EG')}</span>
              </div>
            ))}
            {Object.keys(totals).length === 0 && (
              <p className="text-muted-foreground text-sm text-center">لا يوجد إحصائيات بعد</p>
            )}
          </div>
        </div>
      )}

      {/* Dhikr type selector */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-3 custom-scrollbar">
        {TASBIH_TYPES.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => setTypeIndex(idx)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
              typeIndex === idx
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:bg-secondary'
            }`}
          >
            {t.text.split('ا')[0].substring(0, 8)}...
          </button>
        ))}
      </div>

      {/* Current dhikr text */}
      <div className="text-center mb-2">
        <p className="text-xl font-serif text-primary leading-relaxed">{currentType.text}</p>
        <p className="text-xs text-muted-foreground mt-1">
          المجموع الكلي: <span className="font-bold text-primary">{total.toLocaleString('ar-EG')}</span>
        </p>
      </div>

      {/* Beads + Counter */}
      <div className="flex-1 flex items-center justify-center relative">
        <BeadsSVG count={count} limit={currentType.limit} />
        {/* Counter overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="mt-12">
            <p className="text-6xl font-bold font-serif text-foreground text-center">
              {count % currentType.limit || (count > 0 ? currentType.limit : 0)}
            </p>
            <p className="text-xs text-center text-muted-foreground">{currentType.limit} في الجولة</p>
          </div>
        </div>
      </div>

      {/* Tap button */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <motion.button
          animate={controls}
          onPointerDown={() => setIsPressing(true)}
          onPointerUp={() => { setIsPressing(false); handleTap(); }}
          onPointerLeave={() => setIsPressing(false)}
          className="w-28 h-28 rounded-full flex items-center justify-center select-none touch-none outline-none active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(145deg, hsl(var(--primary)), hsl(var(--primary)/0.7))',
            boxShadow: isPressing
              ? 'inset 6px 6px 12px rgba(0,0,0,0.2)'
              : '6px 6px 16px hsl(var(--primary)/0.3), -4px -4px 12px hsl(var(--card))',
          }}
        >
          <span className="text-primary-foreground font-bold text-lg">سبّح</span>
        </motion.button>
      </div>
    </div>
  );
}
