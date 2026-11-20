const CACHE = 'makhanani-v250';
const FILES = [
  '/','/index.html','/login.html','/teacher.html','/hod.html','/librarian.html','/principal.html','/super_admin.html','/manuals.html','/company-profile.html','/issue.html','/stock.html','/barcode.html','/checklist.html','/bulk_upload.html','/nav.html','/manifest.json','/logo.png','/icon-192.png','/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE ? caches.delete(k) : null))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if(e.request.method!=='GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return res;
    }).catch(()=>caches.match(e.request).then(m=>m || caches.match('/index.html')))
  );
});
