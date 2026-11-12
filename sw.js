// Makhanani LTSM — Service Worker v2.06
// Caches all pages + logo.png so App works OFFLINE
// Update CACHE_NAME every time you update any page

const CACHE_NAME = 'makhanani-ltsm-v2.06';

const FILES = [
  './',
  'index.html',
  'admin.html',
  'issue.html',
  'learner-barcode.html',
  'textbook-barcode.html',
  'librarian.html',
  'principal.html',
  'manifest.json',
  'logo.png'
];

// Install — Download all files + logo.png for offline
self.addEventListener('install', event => {
  console.log('[Makhanani SW] Installing v2.06 — Caching pages + logo.png');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Makhanani SW] Caching:', FILES);
        return cache.addAll(FILES);
      })
      .then(() => {
        console.log('[Makhanani SW] ✅ All files cached — App works offline');
        return self.skipWaiting();
      })
      .catch(err => {
        console.log('[Makhanani SW] ⚠️ Cache failed for some files (maybe logo.png missing?):', err);
        // Still activate even if logo.png missing — don't block app
        return self.skipWaiting();
      })
  );
});

// Activate — Delete old caches (old versions)
self.addEventListener('activate', event => {
  console.log('[Makhanani SW] Activating v2.06 — Cleaning old caches');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Makhanani SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch — Serve from cache if offline, else from network
self.addEventListener('fetch', event => {
  // Only handle GET requests, same origin
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Don't cache Firebase / Google APIs — always go to network
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) {
    return;
  }

  event.respondWith(
    // Try network first, fall back to cache
    fetch(event.request)
      .then(response => {
        // If network works, update cache in background
        if (response && response.status === 200 && url.origin === self.location.origin) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed = OFFLINE — serve from cache
        return caches.match(event.request).then(cached => {
          if (cached) {
            console.log('[Makhanani SW] 📴 OFFLINE — Serving from cache:', event.request.url);
            return cached;
          }
          // If logo.png not cached and offline, return empty — page will show 📚 fallback
          if (event.request.url.includes('logo.png')) {
            console.log('[Makhanani SW] ⚠️ logo.png not in cache — check WORDSWORTH/logo.png exists');
          }
          // If navigating to a page and offline, serve index.html
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
          throw new Error('Offline and not cached: ' + event.request.url);
        });
      })
  );
});

// Listen for message from page — Skip waiting when new version found
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
