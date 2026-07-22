self.addEventListener('install', (event) => {
  // Skip the waiting lifecycle stage, forcing the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all pages under this service worker's scope immediately
  event.waitUntil(self.clients.claim());
});

// A simple fetch handler that just passes through requests
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
