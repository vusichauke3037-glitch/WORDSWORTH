// Makhanani LTSM — Service Worker v2.08 — Offline cache
const CACHE = 'makhanani-v2-08';
const FILES = [
  'index.html',
  'admin.html',
  'issue.html',
  'learner-barcode.html',
  'textbook-barcode.html',
  'librarian.html',
  'principal.html',
  'manifest.json'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(()=> self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(()=> self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(()=> caches.match(e.request).then(cached => cached || caches.match('index.html')))
  );
});
