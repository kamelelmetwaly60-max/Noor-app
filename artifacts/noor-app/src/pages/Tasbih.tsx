import { useLocalStorage } from '@/hooks/use-local-storage';
import { TASBIH_TYPES } from '@/lib/constants';
import { RotateCcw } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Tasbih() {
  const [count, setCount] = useLocalStorage('tasbih_count', 0);
  const [total, setTotal] = useLocalStorage('tasbih_total', 0);
  const [typeIndex, setTypeIndex] = useLocalStorage('tasbih_type_idx', 0);
  
  const controls = useAnimation();
  const [isPressing, setIsPressing] = useState(false);

  const handleTap = () => {
    if ('vibrate' in navigator) navigator.vibrate(15);
    setCount(c => c + 1);
    setTotal(t => t + 1);
    controls.start({
      scale: [1, 0.95, 1],
      transition: { duration: 0.2 }
    });
  };

  const handleReset = () => {
    if(confirm('تصفير العداد الحالي؟')) {
      setCount(0);
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 h-screen flex flex-col max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">السبحة الإلكترونية</h1>
        <button onClick={handleReset} className="p-2 bg-secondary text-primary rounded-full hover:bg-primary/20">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-2 mb-8 flex overflow-x-auto custom-scrollbar shadow-sm">
        {TASBIH_TYPES.map((t, idx) => (
          <button
            key={idx}
            onClick={() => setTypeIndex(idx)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              typeIndex === idx ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-serif text-primary leading-relaxed">{TASBIH_TYPES[typeIndex]}</h2>
          <p className="text-muted-foreground mt-4 text-sm font-bold bg-secondary inline-block px-4 py-1.5 rounded-full">
            المجموع الكلي: {total}
          </p>
        </div>

        <motion.button
          animate={controls}
          onPointerDown={() => setIsPressing(true)}
          onPointerUp={() => setIsPressing(false)}
          onPointerLeave={() => setIsPressing(false)}
          onClick={handleTap}
          className="relative w-64 h-64 rounded-full flex items-center justify-center select-none touch-none outline-none"
          style={{
            background: 'linear-gradient(145deg, hsl(var(--card)), hsl(var(--secondary)))',
            boxShadow: isPressing 
              ? 'inset 10px 10px 20px hsl(var(--border)), inset -10px -10px 20px hsl(var(--card))' 
              : '10px 10px 20px hsl(var(--border)), -10px -10px 20px hsl(var(--card))'
          }}
        >
          {/* Inner ring */}
          <div className="absolute inset-4 rounded-full border-4 border-primary/20 pointer-events-none" />
          
          <div className="text-7xl font-bold text-foreground drop-shadow-sm font-serif">
            {count}
          </div>
        </motion.button>
      </div>
    </div>
  );
}
