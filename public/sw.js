/* Service worker do Herbá: abre offline e economiza dados.
   - páginas e guia (/ervas, /preparo, /identificar): rede primeiro, cai para o cache (e para /offline) sem rede.
     O botão "Salvar guia para usar offline" busca todas elas e este worker as guarda
   - fotos e arquivos estáticos: cache primeiro
   - /api (exceto catálogo e taxonomia): nunca em cache */
const VERSION = "v2";
const PAGES = `herbarium-pages-${VERSION}`;
const ASSETS = `herbarium-assets-${VERSION}`;
const PHOTOS = `herbarium-photos-${VERSION}`;
const DATA = `herbarium-data-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES).then((c) => c.addAll(["/offline"])).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith("herbarium-") && !k.endsWith(VERSION)).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request)) || (fallbackUrl ? await caches.match(fallbackUrl) : Response.error());
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

function isGuidePage(path) {
  return path === "/ervas" || path.startsWith("/ervas/") || path === "/preparo" || path === "/identificar";
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/herbs/")) {
    event.respondWith(cacheFirst(request, PHOTOS));
  } else if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request, ASSETS));
  } else if (
    url.pathname === "/api/herbs" ||
    url.pathname === "/api/taxonomy" ||
    url.pathname === "/api/markers"
  ) {
    // Último catálogo e últimos pontos vistos continuam aparecendo sem rede.
    event.respondWith(networkFirst(request, DATA));
  } else if (url.pathname.startsWith("/api/")) {
    return;
  } else if (request.mode === "navigate" || isGuidePage(url.pathname)) {
    event.respondWith(networkFirst(request, PAGES, "/offline"));
  }
});
