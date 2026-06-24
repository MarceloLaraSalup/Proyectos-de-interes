/**
 * sw.js — Service Worker
 * Cachea todos los assets para que la app funcione sin conexión.
 */

const CACHE_NAME = 'calorie-tracker-v1';

const ASSETS = [
  '/Proyectos-de-interes/QuickFit/',
  '/Proyectos-de-interes/QuickFit/index.html',
  '/Proyectos-de-interes/QuickFit/css/base.css',
  '/Proyectos-de-interes/QuickFit/css/components.css',
  '/Proyectos-de-interes/QuickFit/widgets/protein/widget.js',
  '/Proyectos-de-interes/QuickFit/js/store.js',
  '/Proyectos-de-interes/QuickFit/js/ui.js',
  '/Proyectos-de-interes/QuickFit/js/fooddb.js',
  '/Proyectos-de-interes/QuickFit/js/widgets.js',
  '/Proyectos-de-interes/QuickFit/js/app.js',
  '/Proyectos-de-interes/QuickFit/widgets/calories/widget.js',
  '/Proyectos-de-interes/QuickFit/widgets/meals/widget.js',
  '/Proyectos-de-interes/QuickFit/widgets/history/widget.js',
  '/Proyectos-de-interes/QuickFit/widgets/weight/widget.js',
  '/Proyectos-de-interes/QuickFit/manifest.json',
  '/Proyectos-de-interes/QuickFit/icons/icon-192.png',
  '/Proyectos-de-interes/QuickFit/icons/icon-512.png',
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
