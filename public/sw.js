const CACHE_NAME = 'artisanpilot-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation : on met en cache les fichiers de base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Interception des requêtes : si pas de réseau, on lit dans le cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si le fichier est dans le cache, on le renvoie
      if (response) return response;
      
      // Sinon, on va sur internet
      return fetch(event.request).then(response => {
        // On vérifie si on a une réponse valide
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // On met en cache la nouvelle ressource (images, etc.)
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});