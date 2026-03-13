import { useQuery } from '@tanstack/react-query';

// --- QURAN API ---
export function useQuranSurahs() {
  return useQuery({
    queryKey: ['quran-surahs'],
    queryFn: async () => {
      const res = await fetch('https://api.alquran.cloud/v1/meta');
      if (!res.ok) throw new Error('Failed to fetch surahs');
      const data = await res.json();
      return data.data.surahs.references as Array<{
        number: number;
        name: string;
        englishName: string;
        revelationType: string;
        numberOfAyahs: number;
      }>;
    }
  });
}

export function useSurah(number: number) {
  return useQuery({
    queryKey: ['surah', number],
    queryFn: async () => {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`);
      if (!res.ok) throw new Error('Failed to fetch surah');
      const data = await res.json();
      return data.data;
    },
    enabled: !!number,
  });
}

export function useTafsir(surah: number, ayah: number) {
  return useQuery({
    queryKey: ['tafsir', surah, ayah],
    queryFn: async () => {
      // 16 = Tafsir Al-Jalalayn
      const res = await fetch(`https://api.quran.com/api/v4/tafsirs/16/by_ayah/${surah}:${ayah}?language=ar`);
      if (!res.ok) throw new Error('Failed to fetch tafsir');
      const data = await res.json();
      return data.tafsir;
    },
    enabled: !!surah && !!ayah,
  });
}

// --- PRAYER TIMES API ---
export function usePrayerTimes(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ['prayer-times', lat, lng],
    queryFn: async () => {
      if (!lat || !lng) throw new Error("No coordinates");
      const timestamp = Math.floor(Date.now() / 1000);
      const res = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=4`);
      if (!res.ok) throw new Error('Failed to fetch prayer times');
      const data = await res.json();
      return data.data.timings as Record<string, string>;
    },
    enabled: lat !== null && lng !== null,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// --- ASMAUL HUSNA API ---
export function useAsmaulHusna() {
  return useQuery({
    queryKey: ['asmaul-husna'],
    queryFn: async () => {
      const res = await fetch('https://api.aladhan.com/v1/asmaAlHusna');
      if (!res.ok) throw new Error('Failed to fetch Asmaul Husna');
      const data = await res.json();
      return data.data;
    },
    staleTime: Infinity,
  });
}

// --- RECITERS API ---
export function useReciters() {
  return useQuery({
    queryKey: ['mp3quran-reciters'],
    queryFn: async () => {
      const res = await fetch('https://mp3quran.net/api/v3/reciters?language=ar');
      if (!res.ok) throw new Error('Failed to fetch reciters');
      const data = await res.json();
      return data.reciters;
    },
    staleTime: Infinity,
  });
}
