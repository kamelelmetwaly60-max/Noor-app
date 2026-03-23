const CACHE_NAME = 'noor-sw-v1';
const PRAYER_CHECK_INTERVAL = 60000;

let prayerTimes = null;
let notifPref = 'off';
let adhanReciterId = 'azan1';
let playedToday = {};

const PRAYERS_TO_NOTIFY = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_NAMES_AR = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

const ADHAN_URLS = {
  madinah:  'https://www.islamcan.com/audio/adhan/azan1.mp3',
  makkah:   'https://www.islamicfinder.org/prayer/adhan/makkah.mp3',
  egypt:    'https://www.islamicfinder.org/prayer/adhan/egypt.mp3',
  siddiq:   'https://www.islamicfinder.org/prayer/adhan/siddiq.mp3',
  aqsa:     'https://www.islamicfinder.org/prayer/adhan/aqsa.mp3',
};

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
  startPrayerCheck();
});

self.addEventListener('message', e => {
  const { type, data } = e.data ?? {};
  if (type === 'UPDATE_PRAYER_DATA') {
    prayerTimes = data.prayerTimes;
    notifPref = data.notifPref ?? 'off';
    adhanReciterId = data.adhanReciterId ?? 'azan1';
  }
  if (type === 'PING') {
    e.source?.postMessage({ type: 'PONG' });
  }
});

function pad(n) { return String(n).padStart(2, '0'); }

function checkPrayers() {
  if (!prayerTimes || notifPref === 'off') return;
  const now = new Date();
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const currentStr = `${hh}:${mm}`;
  const dateStr = now.toDateString();

  PRAYERS_TO_NOTIFY.forEach(prayer => {
    const pTime = prayerTimes[prayer];
    if (!pTime) return;
    const normalizedTime = pTime.substring(0, 5);
    const key = `${dateStr}-${prayer}`;
    if (normalizedTime === currentStr && !playedToday[key]) {
      playedToday[key] = true;
      fireNotification(prayer);
      // Clean old entries
      const today = dateStr;
      Object.keys(playedToday).forEach(k => { if (!k.startsWith(today)) delete playedToday[k]; });
    }
  });
}

function fireNotification(prayer) {
  const prayerAr = PRAYER_NAMES_AR[prayer] ?? prayer;
  self.registration.showNotification(`🕌 أذان صلاة ${prayerAr}`, {
    body: 'حيَّ على الصلاة • حيَّ على الفلاح',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `prayer-${prayer}`,
    requireInteraction: true,
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200, 100, 200],
    data: { prayer, url: '/' },
  });
}

function startPrayerCheck() {
  setInterval(checkPrayers, PRAYER_CHECK_INTERVAL);
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url ?? '/';
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) { client.focus(); return; }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
