const CACHE_PREFIX = "baddelha";
const CACHE_NAME = `${CACHE_PREFIX}-v1`;
const STATIC_ASSETS = ["/offline", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-maskable.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

function isSupabaseRequest(url) {
  return url.hostname.includes("supabase.co") || url.pathname.includes("/rest/v1/") || url.pathname.includes("/auth/v1/");
}

function isPrivatePath(pathname) {
  return ["/auth", "/login", "/dashboard", "/deals", "/notifications", "/admin"].some(
    (blockedPath) => pathname === blockedPath || pathname.startsWith(`${blockedPath}/`),
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (isSupabaseRequest(url)) return;

  const isStaticAsset = STATIC_ASSETS.includes(url.pathname);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return cache.match("/offline") || Response.error();
      }),
    );
    return;
  }

  if (isPrivatePath(url.pathname)) return;

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        });
      }),
    );
  }
});
