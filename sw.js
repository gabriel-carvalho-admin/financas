// Cache simples: tenta a rede primeiro e usa o cache quando estiver sem internet
const C = "mf-v19", ARQ = ["./", "index.html", "styles.css", "app.js", "dilcar.html", "dilcar.js", "manifest.webmanifest", "icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(ARQ)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || (u.origin !== location.origin && u.hostname !== "www.gstatic.com")) return;
  e.respondWith(fetch(e.request, u.origin === location.origin ? { cache: "no-cache" } : {}).then(r => { const k = r.clone(); caches.open(C).then(c => c.put(e.request, k)); return r; }).catch(() => caches.match(e.request)));
});
