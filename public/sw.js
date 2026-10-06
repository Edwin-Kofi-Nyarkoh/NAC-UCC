const CACHE = "nac-ucc-v2";
const OFFLINE_URL = "/offline";
const PRECACHE = ["/", OFFLINE_URL, "/events", "/sermons", "/news", "/medical-ministry"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Build output is content-hashed and icons/fonts rarely change, so these are
// safe to serve cache-first. Nothing else is: page data fetched during
// client-side navigation must come from the network, or newly published
// content would never show up.
function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:png|jpe?g|svg|webp|avif|ico|woff2?)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // Skip cross-origin and API requests (always network)
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api")) return;

  // Network-first for HTML navigation, cache-first for static assets
  const isNavigation = e.request.mode === "navigate";

  if (isNavigation) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
  } else if (isStaticAsset(url)) {
    e.respondWith(
      caches.match(e.request).then(
        (cached) =>
          cached ||
          fetch(e.request).then((res) => {
            if (res.status === 200) {
              const clone = res.clone();
              caches.open(CACHE).then((c) => c.put(e.request, clone));
            }
            return res;
          })
      )
    );
  }
});
