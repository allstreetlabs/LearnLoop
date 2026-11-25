const CACHE = 'learnloop-shell-v3';
const SHELL = ['/', '/app.js', '/learning.js', '/screens.js', '/style.css', '/icon.svg', '/manifest.webmanifest'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))));
// A new worker waits for existing tabs to close; never reload a live answer.
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  const u = new URL(event.request.url);
  if (u.origin !== self.location.origin || u.pathname.startsWith('/api/') || event.request.method !== 'GET') return;
  if (!SHELL.includes(u.pathname)) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    try { const response = await fetch(event.request); if (response.ok) await cache.put(event.request, response.clone()); return response; }
    catch { return (await cache.match(event.request)) || (event.request.mode === 'navigate' ? cache.match('/') : Response.error()); }
  }));
});
