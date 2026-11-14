// Makhanani LTSM — Service Worker v1.0 — Offline Mode
// Caches app shell so Home + Issue + Learners + Textbooks + Barcodes open offline.
// Firebase data is NOT cached — Issue / Return offline uses local queue (see offline-queue.js).
const CACHE = 'makhanani-v1-0';
const CORE = [
  './',
  './index.html',
  './issue.html',
  './learner-barcode.html',
  './textbook-barcode.html',
  './barcode-print.html',
  './librarian.html',
  './principal.html',
  './profile.html',
  './checklist-principal.html',
  './summary.html',
  './master-checklist.html',
  './company-profile.html',
  './terms-and-conditions.html',
  './logo.png',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Never cache Firebase / Google APIs — they need live internet
  if (url.hostname.includes('firestore') || url.hostname.includes('firebase') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) {
    return; // let browser handle it (will fail offline, queue handles it)
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Cache same-origin HTML/CSS/JS/images on the fly
        if (e.request.method === 'GET' && url.origin === self.location.origin && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
