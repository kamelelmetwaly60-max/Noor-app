import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, MapPin, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MosqueIcon } from '@/components/NoorIcons';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Mosque {
  id: number;
  name: string;
  lat: number;
  lng: number;
  distance: number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dl   = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(m: number) {
  return m < 1000 ? `${Math.round(m)} م` : `${(m / 1000).toFixed(1)} كم`;
}

const mosquePin = L.divIcon({
  html: `<div style="width:34px;height:34px;background:linear-gradient(135deg,#C19A6B,#8a6a3a);border-radius:50% 50% 0 50%;transform:rotate(45deg);border:2.5px solid #fff;box-shadow:0 3px 10px rgba(193,154,107,0.5)"></div>`,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -38],
});

const selectedPin = L.divIcon({
  html: `<div style="width:42px;height:42px;background:linear-gradient(135deg,#e8b87d,#C19A6B);border-radius:50% 50% 0 50%;transform:rotate(45deg);border:3px solid #fff;box-shadow:0 0 22px rgba(193,154,107,0.85),0 4px 12px rgba(0,0,0,0.25)"></div>`,
  className: '',
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -46],
});

const userPin = L.divIcon({
  html: `<div style="width:18px;height:18px;background:#3B82F6;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 5px rgba(59,130,246,0.25),0 2px 8px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FlyTo({ to, bounds }: { to: [number, number] | null; bounds: [[number,number],[number,number]] | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
    } else if (to) {
      map.flyTo(to, 15, { animate: true, duration: 0.8 });
    }
  }, [to, bounds, map]);
  return null;
}

export function MosquesFinder() {
  const [userLoc, setUserLoc]         = useState<[number, number] | null>(null);
  const [mosques, setMosques]         = useState<Mosque[]>([]);
  const [selected, setSelected]       = useState<Mosque | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [flyTo, setFlyTo]             = useState<[number, number] | null>(null);
  const [bounds, setBounds]           = useState<[[number,number],[number,number]] | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('متصفحك لا يدعم تحديد الموقع');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        setUserLoc([lat, lng]);
        setFlyTo([lat, lng]);
        try {
          const q = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:2000,${lat},${lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:2000,${lat},${lng}););out center;`;
          const res  = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`);
          const data = await res.json();
          const list: Mosque[] = (data.elements as any[])
            .map(el => {
              const elat = el.lat ?? el.center?.lat;
              const elng = el.lon ?? el.center?.lon;
              if (!elat || !elng) return null;
              return {
                id: el.id,
                name: el.tags?.['name:ar'] ?? el.tags?.name ?? 'مسجد',
                lat: elat,
                lng: elng,
                distance: haversine(lat, lng, elat, elng),
              };
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance) as Mosque[];
          setMosques(list);
        } catch {
          setError('تعذّر جلب بيانات المساجد، حاول لاحقاً');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('لم يُمنح التطبيق إذن الوصول إلى موقعك');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  const pick = useCallback((mosque: Mosque) => {
    setSelected(mosque);
    setBounds(null);
    setFlyTo(null);
    if (userLoc) {
      const b: [[number,number],[number,number]] = [
        [Math.min(userLoc[0], mosque.lat) - 0.001, Math.min(userLoc[1], mosque.lng) - 0.001],
        [Math.max(userLoc[0], mosque.lat) + 0.001, Math.max(userLoc[1], mosque.lng) + 0.001],
      ];
      setBounds(b);
    }
    setTimeout(() => {
      cardRefs.current[mosque.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
  }, [userLoc]);

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto bg-background" dir="rtl">
      <div className="px-4 py-4 flex items-center gap-4 bg-card shadow-sm border-b border-border flex-shrink-0">
        <Link href="/more">
          <button className="p-2 bg-secondary rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="font-bold text-xl" style={{ fontFamily: '"Tajawal", sans-serif' }}>المساجد القريبة</h1>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            {loading ? 'جاري البحث...' : error ? 'حدث خطأ' : `${mosques.length} مسجد في نطاق 2 كم`}
          </p>
        </div>
      </div>

      <div className="flex-shrink-0" style={{ height: '42%' }}>
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm" style={{ fontFamily: '"Tajawal", sans-serif' }}>جاري تحديد موقعك...</p>
          </div>
        ) : error ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="font-bold" style={{ fontFamily: '"Tajawal", sans-serif' }}>{error}</p>
          </div>
        ) : userLoc ? (
          <MapContainer
            center={userLoc}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              maxZoom={19}
              detectRetina
            />
            <FlyTo to={flyTo} bounds={bounds} />

            <Marker position={userLoc} icon={userPin}>
              <Popup><span dir="rtl" style={{ fontFamily: '"Tajawal"' }}>موقعك الحالي</span></Popup>
            </Marker>

            {selected && (
              <Polyline
                positions={[userLoc, [selected.lat, selected.lng]]}
                color="#C19A6B"
                weight={3.5}
                dashArray="10 7"
                opacity={0.85}
              />
            )}

            {mosques.map(m => (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                icon={selected?.id === m.id ? selectedPin : mosquePin}
                eventHandlers={{ click: () => pick(m) }}
              >
                <Popup>
                  <div dir="rtl" style={{ fontFamily: '"Tajawal"' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: 2 }}>{m.name}</p>
                    <p style={{ fontSize: 12, color: '#888' }}>{fmtDist(m.distance)}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {!loading && !error && mosques.length === 0 && (
          <div className="text-center py-16 text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            لا توجد مساجد في نطاق 2 كيلومتر من موقعك
          </div>
        )}
        {mosques.map(m => {
          const isActive = selected?.id === m.id;
          return (
            <div
              key={m.id}
              ref={el => { cardRefs.current[m.id] = el; }}
              onClick={() => pick(m)}
              className="flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all"
              style={{
                background: isActive ? 'rgba(193,154,107,0.1)' : undefined,
                borderColor: isActive ? 'rgba(193,154,107,0.4)' : undefined,
                boxShadow: isActive ? '0 0 18px rgba(193,154,107,0.18)' : undefined,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: isActive ? 'rgba(193,154,107,0.2)' : 'rgba(193,154,107,0.08)' }}
              >
                <MosqueIcon className="text-primary" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate" style={{ fontFamily: '"Tajawal", sans-serif' }}>{m.name}</p>
                <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span style={{ fontFamily: '"Tajawal", sans-serif' }}>{fmtDist(m.distance)}</span>
                </div>
              </div>
              {isActive && (
                <div className="flex items-center gap-1 text-xs font-bold" style={{ color: '#C19A6B', fontFamily: '"Tajawal", sans-serif' }}>
                  <Navigation className="w-4 h-4" />
                  <span>يعرض على الخريطة</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
