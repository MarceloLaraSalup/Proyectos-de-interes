/**
 * sw.js — Service Worker
 * Cachea todos los assets para que la app funcione sin conexión.
 */

const CACHE_NAME = 'calorie-tracker-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/components.css',
  '/js/store.js',
  '/js/ui.js',
  '/js/fooddb.js',
  '/js/widgets.js',
  '/js/app.js',
  '/widgets/calories/widget.js',
  '/widgets/meals/widget.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/widgets/history/widget.js',
];

// Instalar: cachear todos los assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar: limpiar caches viejas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first, fallback a red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
