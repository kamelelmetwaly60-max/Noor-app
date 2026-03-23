const CACHE_NAME = 'noor-sw-v3';

let prayerTimes = null;
let notifPref = 'off';
let adhanReciterId = 'azan1';
let scheduledIds = [];
let midnightId = null;

const PRAYERS_TO_NOTIFY = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_NAMES_AR = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.all([
      clients.claim(),
      // Ask all open clients to resend prayer data
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
        list.forEach(c => { try { c.postMessage({ type: 'REQUEST_PRAYER_DATA' }); } catch {} });
      }),
    ])
  );
  scheduleMidnightRefresh();
});

self.addEventListener('message', e => {
  const { type, data } = e.data ?? {};
  if (type === 'UPDATE_PRAYER_DATA') {
    prayerTimes = data.prayerTimes;
    notifPref = data.notifPref ?? 'off';
    adhanReciterId = data.adhanReciterId ?? 'azan1';
    scheduleAll();
  }
  if (type === 'PING') {
    try { e.source?.postMessage({ type: 'PONG' }); } catch {}
  }
});

// ── Precise scheduling ──────────────────────────────────────────────────────

function clearScheduled() {
  scheduledIds.forEach(id => clearTimeout(id));
  scheduledIds = [];
}

function scheduleAll() {
  clearScheduled();
  if (!prayerTimes || notifPref === 'off') return;

  const now = Date.now();

  PRAYERS_TO_NOTIFY.forEach(prayer => {
    const timeStr = prayerTimes[prayer];
    if (!timeStr) return;

    const parts = timeStr.substring(0, 5).split(':');
    const hh = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);

    const target = new Date();
    target.setHours(hh, mm, 0, 0);

    const delay = target.getTime() - now;

    // Only schedule if within next 24 hours and strictly in the future
    if (delay > 0 && delay < 86400000) {
      const id = setTimeout(() => {
        fireNotification(prayer);
        // Remove this id from tracking
        scheduledIds = scheduledIds.filter(x => x !== id);
      }, delay);
      scheduledIds.push(id);
    }
  });
}

function fireNotification(prayer) {
  const prayerAr = PRAYER_NAMES_AR[prayer] ?? prayer;
  self.registration.showNotification('🕌 أذان صلاة ' + prayerAr, {
    body: 'حيَّ على الصلاة • حيَّ على الفلاح',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'prayer-' + prayer,
    requireInteraction: true,
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200, 100, 200, 100, 400],
    data: { prayer, url: '/' },
  });
}

// Re-schedule every midnight so we stay in sync for the new day
function scheduleMidnightRefresh() {
  if (midnightId) clearTimeout(midnightId);
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 1, 0, 0); // 00:01 next day
  const delay = midnight.getTime() - now.getTime();
  midnightId = setTimeout(() => {
    // Ask clients to resend today's prayer data
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      list.forEach(c => { try { c.postMessage({ type: 'REQUEST_PRAYER_DATA' }); } catch {} });
    });
    // If no clients reply within 5s, clear schedule (will reschedule when app opens)
    setTimeout(() => {
      if (scheduledIds.length === 0) {
        // no data received, nothing to do
      }
    }, 5000);
    scheduleMidnightRefresh();
  }, delay);
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) ? e.notification.data.url : '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
