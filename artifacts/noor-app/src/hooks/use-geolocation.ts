import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const requestLocation = () => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      setError("خدمة الموقع غير مدعومة في متصفحك");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        setError("لم نتمكن من تحديد موقعك. يرجى تفعيل الموقع.");
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    // Attempt automatically on mount
    requestLocation();
  }, []);

  return { coords, error, isLoading, requestLocation };
}

export function calculateQibla(lat: number, lng: number): number {
  const MAKKAH_LAT = 21.422487;
  const MAKKAH_LNG = 39.826206;

  const latRad = (lat * Math.PI) / 180;
  const makkahLatRad = (MAKKAH_LAT * Math.PI) / 180;
  const lngDiffRad = ((MAKKAH_LNG - lng) * Math.PI) / 180;

  const y = Math.sin(lngDiffRad);
  const x = Math.cos(latRad) * Math.tan(makkahLatRad) - Math.sin(latRad) * Math.cos(lngDiffRad);
  
  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;
  
  return (qiblaDeg + 360) % 360;
}
