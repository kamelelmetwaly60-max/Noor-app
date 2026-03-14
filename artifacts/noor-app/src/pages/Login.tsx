import { useState } from 'react';
import { EGYPT_GOVERNORATES } from '@/lib/constants';

interface LoginProps {
  onComplete: () => void;
}

export function Login({ onComplete }: LoginProps) {
  const [name, setName] = useState('');
  const [govId, setGovId] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const handleSubmit = () => {
    if (!name.trim() || !govId) return;
    const gov = EGYPT_GOVERNORATES.find(g => g.id === govId);
    if (!gov) return;
    const profile = { name: name.trim(), governorateId: govId, governorateName: gov.name, lat: gov.lat, lng: gov.lng };
    localStorage.setItem('user_profile', JSON.stringify(profile));
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6" dir="rtl">
      {/* Background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C19A6B]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#C19A6B]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-[#C19A6B] to-[#a07a4a] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-[#C19A6B]/30">
            <span className="text-white text-4xl font-serif">ن</span>
          </div>
          <h1 className="text-5xl font-serif text-[#C19A6B] mb-2">نُور</h1>
          <p className="text-white/50 text-sm">تطبيق إسلامي شامل</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          {step === 1 ? (
            <>
              <h2 className="text-white text-xl font-bold text-center mb-2">أهلاً وسهلاً</h2>
              <p className="text-white/50 text-sm text-center mb-6">من فضلك أدخل اسمك للمتابعة</p>
              <div className="mb-4">
                <label className="text-white/70 text-sm mb-2 block">الاسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="اكتب اسمك هنا..."
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 outline-none focus:border-[#C19A6B]/60 focus:ring-2 focus:ring-[#C19A6B]/20 transition-all text-base"
                  onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
                />
              </div>
              <button
                onClick={() => name.trim() && setStep(2)}
                disabled={!name.trim()}
                className="w-full py-4 bg-gradient-to-l from-[#C19A6B] to-[#d4a97c] text-white font-bold rounded-2xl transition-all disabled:opacity-40 hover:opacity-90 active:scale-98 shadow-lg shadow-[#C19A6B]/20 text-base"
              >
                التالي →
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setStep(1)} className="text-white/50 hover:text-white p-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-white text-xl font-bold">أهلاً {name} 🌙</h2>
                  <p className="text-white/50 text-sm">اختر محافظتك لمواقيت الصلاة</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-white/70 text-sm mb-2 block">المحافظة</label>
                <select
                  value={govId}
                  onChange={e => setGovId(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-[#C19A6B]/60 focus:ring-2 focus:ring-[#C19A6B]/20 transition-all text-base appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-900">اختر المحافظة...</option>
                  {EGYPT_GOVERNORATES.map(g => (
                    <option key={g.id} value={g.id} className="bg-gray-900">{g.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!govId}
                className="w-full py-4 bg-gradient-to-l from-[#C19A6B] to-[#d4a97c] text-white font-bold rounded-2xl transition-all disabled:opacity-40 hover:opacity-90 active:scale-98 shadow-lg shadow-[#C19A6B]/20 text-base"
              >
                دخول للتطبيق ✨
              </button>
            </>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          يمكنك تغيير هذه المعلومات لاحقاً من صفحة المزيد
        </p>
      </div>
    </div>
  );
}
