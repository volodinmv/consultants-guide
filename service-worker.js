const CACHE_NAME = 'consultant-guide-cache-v8';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/data.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Событие 'install' - происходит при первой установке сервис-воркера
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching offline page');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
});

// Событие 'fetch' - происходит каждый раз, когда приложение запрашивает какой-либо ресурс (страницу, стиль, скрипт)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Если ресурс есть в кэше, возвращаем его.
        // Если нет, обращаемся к сети (fetch).
        return response || fetch(event.request);
      })
  );
});
