const CACHE='makhanani-v175';
const FILES=['index.html','issue.html','textbook-barcode.html','learner-barcode.html','admin.html','principal.html','librarian.html','cloud.js','manifest.json','logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE?caches.delete(k):null))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;if(e.request.url.includes('firebase')||e.request.url.includes('gstatic')){return e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));}e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;}).catch(()=>caches.match('index.html'))));});
