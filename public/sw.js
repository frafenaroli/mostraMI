/* MostraMI service worker — hand-rolled, dependency-free.
 * Strategy:
 *  - navigations: network-first, fall back to the cached app shell (index.html)
 *    so the SPA still boots offline (HashRouter resolves the route client-side).
 *  - mostre.json: network-first, fall back to the last cached dataset.
 *  - other same-origin static assets (hashed JS/CSS, icons, svg): stale-while-revalidate.
 *  - Google Fonts (CSS + font files): cache-first, best-effort.
 * URLs are relative to the SW scope, so the app works from any GitHub Pages subpath.
 */
const VERSION = 'v1';
const SHELL_CACHE = `mostrami-shell-${VERSION}`;
const ASSET_CACHE = `mostrami-assets-${VERSION}`;
const DATA_CACHE = `mostrami-data-${VERSION}`;
const FONT_CACHE = `mostrami-fonts-${VERSION}`;

// App-shell essentials known by stable name (hashed assets are cached at runtime).
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL_CACHE, ASSET_CACHE, DATA_CACHE, FONT_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const FONT_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const shell = await caches.match(fallbackUrl);
      if (shell) return shell;
    }
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || network || fetch(request);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cross-origin: only handle Google Fonts (cache-first); ignore everything else.
  if (url.origin !== self.location.origin) {
    if (FONT_HOSTS.has(url.hostname)) {
      event.respondWith(cacheFirst(request, FONT_CACHE).catch(() => fetch(request)));
    }
    return;
  }

  // App-shell navigations: network-first with offline fallback to index.html.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE, './index.html'));
    return;
  }

  // Live dataset: always try the network first, keep a copy for offline.
  if (url.pathname.endsWith('/mostre.json')) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  // Everything else same-origin (hashed assets, icons, svg): fast + self-updating.
  event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
});
