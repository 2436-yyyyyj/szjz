const CACHE_PREFIX = "shenzhou-catalog";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(clearOldCaches());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clearOldCaches().then(() => self.clients.claim()));
});

self.addEventListener("fetch", () => {});

function clearOldCaches() {
  return caches.keys().then((keys) =>
    Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX))
        .map((key) => caches.delete(key))
    )
  );
}
