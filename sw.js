// Makhanani LTSM — Service Worker — PWA
const CACHE_NAME = 'makhanani-ltsm-v3';
const CORE = [
  './',
  './index.html',
  './manual.html',
  './librarian.html',
  './issue.html',
  './teachers.html',
  './principal.html',
  './stock.html',
  './barcode.html',
  './profile.html',
  './logo.png',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME ? caches.delete(k) : null))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Never cache Firebase / Google / WhatsApp / CDN — Always go to network
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic') || url.hostname.includes('unpkg') || url.hostname.includes('wa.me') || url.hostname.includes('cdn')) {
    return;
  }
  // For our own pages: Network first, fallback to cache (so new version shows fast, offline still works)
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then((cached) => cached || caches.match('./index.html')))
  );
});
