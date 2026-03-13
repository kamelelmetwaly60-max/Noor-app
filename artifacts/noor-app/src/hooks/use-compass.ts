import { useState, useEffect } from 'react';

export function useCompass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // iOS
      if ((event as any).webkitCompassHeading) {
        setHeading((event as any).webkitCompassHeading);
      } 
      // Android / Standard
      else if (event.alpha !== null) {
        // Absolute orientation required
        setHeading(Math.abs(event.alpha - 360));
      } else {
        setIsSupported(false);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientationabsolute', handleOrientation);
      window.addEventListener('deviceorientation', handleOrientation);
    } else {
      setIsSupported(false);
      setError("حساس البوصلة غير مدعوم في جهازك");
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setError(null);
        } else {
          setError("لم يتم منح الإذن للوصول للبوصلة");
        }
      } catch (err) {
        setError("حدث خطأ أثناء طلب الإذن");
      }
    }
  };

  return { heading, error, isSupported, requestPermission };
}
