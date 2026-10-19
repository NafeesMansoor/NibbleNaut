/*
 * Fish Fight service worker.
 * GENERATED at build time from src/pwa/sw.template.js by tools/sw-plugin.ts — edit the template,
 * never dist/sw.js. The version and precache list below are filled in by the build, so every
 * release changes this script's bytes and browsers detect the update.
 */
const VERSION = '__APP_VERSION__';
const CACHE_PREFIX = 'fish-fight-v';
const CACHE = CACHE_PREFIX + VERSION;
const PRECACHE = __PRECACHE__;
const SHELL = new URL('./index.html', self.location).href;

self.addEventListener('install', (event) => {
  // Bypass the HTTP cache so a release can never precache a stale file. cache.addAll is
  // all-or-nothing: if any asset fails, the install fails and the previous version keeps running.
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        await cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })));
      } catch (err) {
        // Don't leave a half-filled cache behind; the browser retries on the next update check.
        await caches.delete(CACHE);
        throw err;
      }
    })(),
  );
  // No skipWaiting() here: the page asks for it when switching is safe (never mid-match).
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Only Fish Fight's own, older caches. Other apps on this origin are left alone.
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Cross-origin requests go straight to the network.
  if (url.origin !== self.location.origin) return;
  // The service worker script itself is always fetched by the browser's update check.
  if (url.pathname.endsWith('/sw.js')) return;

  if (req.mode === 'navigate') {
    // App shell: serve the index.html precached with THIS version, so the HTML always matches the
    // hashed JS/CSS in the same cache, online or offline. New releases arrive through the
    // service worker update flow, not by mixing a new HTML page with old assets.
    event.respondWith(
      (async () => {
        const cached = await caches.match(SHELL, { cacheName: CACHE });
        if (cached) return cached;
        try {
          return await fetch(req);
        } catch {
          return (await caches.match(SHELL)) || Response.error();
        }
      })(),
    );
    return;
  }

  // Hashed, versioned assets: cache-first. Anything same-origin not precached is cached on first use.
  event.respondWith(
    (async () => {
      const cached = await caches.match(req, { cacheName: CACHE, ignoreSearch: true });
      if (cached) return cached;
      const res = await fetch(req);
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      }
      return res;
    })(),
  );
});
