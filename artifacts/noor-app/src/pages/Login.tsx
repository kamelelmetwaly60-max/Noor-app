import { useState } from 'react';
import { EGYPT_GOVERNORATES } from '@/lib/constants';
import { signInWithGoogle, isConfigured } from '@/lib/firebase';

interface LoginProps {
  onComplete: () => void;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function IslamicDivider() {
  return (
    <div className="flex items-center gap-2 my-5">
      <div className="flex-1 h-px" style={{ background: 'rgba(193,154,107,0.25)' }} />
      <svg width="20" height="20" viewBox="0 0 40 40" opacity={0.5}>
        <polygon points="20,2 24,14 37,14 27,22 31,35 20,27 9,35 13,22 3,14 16,14" fill="#C19A6B"/>
      </svg>
      <div className="flex-1 h-px" style={{ background: 'rgba(193,154,107,0.25)' }} />
    </div>
  );
}

export function Login({ onComplete }: LoginProps) {
  const [name, setName] = useState('');
  const [govId, setGovId] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !govId) return;
    const gov = EGYPT_GOVERNORATES.find(g => g.id === govId);
    if (!gov) return;
    const profile = { name: name.trim(), governorateId: govId, governorateName: gov.name, lat: gov.lat, lng: gov.lng };
    localStorage.setItem('user_profile', JSON.stringify(profile));
    onComplete();
  };

  const handleGoogleSignIn = async () => {
    if (!isConfigured) {
      setGoogleError('لم يتم ربط Firebase بعد — تواصل مع المطور');
      return;
    }
    setGoogleLoading(true);
    setGoogleError('');
    try {
      const user = await signInWithGoogle();
      if (user) {
        const defaultGov = EGYPT_GOVERNORATES[0];
        const profile = {
          name: user.name || 'مستخدم Google',
          email: user.email,
          photo: user.photo,
          governorateId: defaultGov.id,
          governorateName: defaultGov.name,
          lat: defaultGov.lat,
          lng: defaultGov.lng,
          via: 'google',
        };
        localStorage.setItem('user_profile', JSON.stringify(profile));
        onComplete();
      }
    } catch (e: any) {
      setGoogleError('فشل تسجيل الدخول بجوجل — حاول مرة أخرى');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6" dir="rtl">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C19A6B]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#C19A6B]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-4 w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(193,154,107,0.3)', boxShadow: '0 0 30px rgba(193,154,107,0.15)' }} />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#C19A6B] to-[#a07a4a] flex items-center justify-center shadow-2xl">
              <span className="text-white text-4xl" style={{ fontFamily: '"Amiri", serif' }}>ن</span>
            </div>
          </div>
          <h1 className="text-5xl text-[#C19A6B] mb-1" style={{ fontFamily: '"Amiri", serif', textShadow: '0 0 20px rgba(193,154,107,0.3)' }}>نُـور</h1>
          <p className="text-white/40 text-xs tracking-widest">تطبيق إسلامي شامل</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-98 mb-1"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
            }}
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span>تسجيل الدخول بـ Google</span>
          </button>
          {googleError && (
            <p className="text-red-400 text-xs text-center mt-1 mb-1">{googleError}</p>
          )}

          <IslamicDivider />

          {step === 1 ? (
            <>
              <h2 className="text-white text-lg font-bold text-center mb-1">أو أدخل بياناتك</h2>
              <p className="text-white/40 text-xs text-center mb-5">أدخل اسمك لمتابعة التسجيل</p>
              <div className="mb-4">
                <label className="text-white/60 text-xs mb-1.5 block">الاسم</label>
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
                className="w-full py-4 font-bold rounded-2xl transition-all disabled:opacity-40 hover:opacity-90 active:scale-98 shadow-lg text-base"
                style={{ background: 'linear-gradient(135deg, #C19A6B, #d4a97c)', color: '#000', boxShadow: '0 4px 20px rgba(193,154,107,0.25)' }}
              >
                التالي ←
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => setStep(1)} className="text-white/50 hover:text-white p-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-white text-lg font-bold">أهلاً {name}</h2>
                  <p className="text-white/40 text-xs">اختر محافظتك لمواقيت الصلاة</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-white/60 text-xs mb-1.5 block">المحافظة</label>
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
                className="w-full py-4 font-bold rounded-2xl transition-all disabled:opacity-40 hover:opacity-90 active:scale-98 shadow-lg text-base"
                style={{ background: 'linear-gradient(135deg, #C19A6B, #d4a97c)', color: '#000', boxShadow: '0 4px 20px rgba(193,154,107,0.25)' }}
              >
                دخول للتطبيق
              </button>
            </>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-5">
          يمكنك تغيير هذه المعلومات لاحقاً من صفحة المزيد
        </p>
      </div>
    </div>
  );
}
