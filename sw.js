// Makhanani LTSM — sw.js v1.87 — PWA Offline Shell
const CACHE = 'makhanani-ltsm-v187';
const CORE = [
  './',
  './index.html',
  './learner-barcode.html',
  './textbook-barcode.html',
  './issue.html',
  './librarian.html',
  './admin.html',
  './principal.html',
  './cloud.js',
  './manifest.json',
  './logo.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for Firestore / Firebase (never cache), Cache-first for app shell
self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  // Never cache Firebase / Google APIs — always go to network
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase') ||
    url.includes('googleapis.com') ||
    url.includes('gstatic.com')
  ) {
    return e.respondWith(fetch(e.request));
  }
  // For pages / assets: try network, fall back to cache (offline)
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        if (e.request.method === 'GET' && res.status === 200) {
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
  );
});
