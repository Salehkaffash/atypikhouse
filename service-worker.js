// Nom du cache
const CACHE_NAME = 'site-cache-v1';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/css/bootstrap.css',
  '/css/bootstrap.min.css',
  '/js/bootstrap.js',
  '/js/bootstrap.min.js',
  '/js/bootstrap.bundle.js',
  '/js/jquery.min.js',
  '/js/popper.min.js',
  '/js/main.js',
  '/images',
  '/images/logo.svg',
  '/images/atypik-house.webp',
  '/images/blog.webp',
  '/images/bulle.webp',
  '/images/chalet.webp',
  '/images/enveloppe.webp',
  '/images/Tiny-House.webp',
  '/images/Yourte.webp',
  '/images/tente-atypik-house.webp',
  '/images/Maison-Hobbit.webp',
  '/images/logo-footer.svg',
  // Ajoute ici toutes les ressources statiques que tu veux mettre en cache
];

// Installation du service worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker et nettoyage des anciens caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});
