// ✅ MagnetMoney Service Worker
// Version badlne pe cache automatically update hoga
const CACHE_NAME = 'magnetmoney-v1';

// Cache karne wali files
const ASSETS = [
  './MagnetMoney.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap'
];

// ── INSTALL: Files cache karo ──
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching assets');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: Purana cache delete karo ──
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: Cache-first strategy ──
self.addEventListener('fetch', event => {
  // Only GET requests handle karo
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Cache mein mila → return karo
        return cached;
      }
      // Network se fetch karo aur cache mein save karo
      return fetch(event.request).then(response => {
        // Sirf valid responses cache karo
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, cloned);
        });
        return response;
      }).catch(() => {
        // Offline fallback
        return caches.match('./MagnetMoney.html');
      });
    })
  );
});
