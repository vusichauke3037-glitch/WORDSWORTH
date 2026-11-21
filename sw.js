const CACHE = "makhanani-ltsm-v2-52";
const FILES = [
  "./",
  "./index.html",
  "./login.html",
  "./register.html",
  "./stock.html",
  "./issue.html",
  "./librarian.html",
  "./hod.html",
  "./teacher.html",
  "./principal.html",
  "./super_admin.html",
  "./school_admin.html",
  "./learners.html",
  "./subscription.html",
  "./pricing.html",
  "./terms.html",
  "./privacy.html",
  "./manual.html",
  "./manifest.json",
  "./logo.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.url.includes("firebase") || e.request.url.includes("gstatic") || e.request.url.includes("googleapis")) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return res;
    }).catch(()=>caches.match(e.request))
  );
});
