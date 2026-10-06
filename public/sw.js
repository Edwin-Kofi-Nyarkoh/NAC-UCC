// The site's service worker. It runs in the browser, for the website and the
// installed app alike, and does two things:
//
//   1. keeps the files that never change (scripts, styles, fonts, icons) on the
//      device, so later visits start faster and use less data;
//   2. shows the "You're offline" page when a page is asked for and there is no
//      connection, in place of the browser's own error screen.
//
// It never keeps a copy of a page, or of anything from /api. What a visitor
// reads is always what the site says now, never something saved earlier.

// Change the number whenever this file, offline.html or a file in /icons
// changes. Browsers then throw the old cache away and start a fresh one.
const CACHE = "nac-ucc-v3"

const OFFLINE_PAGE = "/offline.html"
// Everything the offline page needs to draw, fetched while there is a connection
const OFFLINE_FILES = [OFFLINE_PAGE, "/icons/icon-192.png", "/favicon.ico"]

// Each new version of the site brings new script and style files. Without a
// limit the old ones would pile up on the device for ever.
const MAX_FILES = 150

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // "reload" skips the browser's own cache, so a new version really is new
      .then((cache) => cache.addAll(OFFLINE_FILES.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)))
      // Lets the browser start fetching a page while this worker is still waking up
      await self.registration.navigationPreload?.enable()
      await self.clients.claim()
    })()
  )
})

/** Files whose address changes whenever their content does, plus icons. */
function neverChanges(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:png|jpe?g|svg|webp|avif|ico|woff2?)$/.test(url.pathname)
  )
}

// Used only if the browser has cleared this site's storage, offline page included
const LAST_RESORT =
  "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width, initial-scale=1'>" +
  "<title>You're offline</title><body style='font-family:system-ui,sans-serif;text-align:center;padding:3rem 1.5rem'>" +
  "<h1>You're offline</h1><p>Check your internet connection and try again.</p>"

/** A page: always from the network. With no connection, the offline page. */
async function page(event) {
  try {
    return (await event.preloadResponse) || (await fetch(event.request))
  } catch {
    const offlinePage = await caches.match(OFFLINE_PAGE)
    return offlinePage ?? new Response(LAST_RESORT, { headers: { "Content-Type": "text/html; charset=utf-8" } })
  }
}

/** A file that never changes: from the device if it is there, otherwise fetched and kept. */
async function unchangingFile(request) {
  const cache = await caches.open(CACHE)
  const kept = await cache.match(request)
  if (kept) return kept

  const response = await fetch(request)
  if (response.status === 200) {
    await cache.put(request, response.clone())
    // Oldest first; the offline page's own files are never dropped
    const entries = await cache.keys()
    const droppable = entries.filter((entry) => !OFFLINE_FILES.includes(new URL(entry.url).pathname))
    await Promise.all(droppable.slice(0, Math.max(0, entries.length - MAX_FILES)).map((entry) => cache.delete(entry)))
  }
  return response
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  // Other sites (Cloudinary, Paystack) and our own API always go to the network
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api")) return

  if (request.mode === "navigate") {
    event.respondWith(page(event))
  } else if (neverChanges(url)) {
    event.respondWith(unchangingFile(request))
  }
})
