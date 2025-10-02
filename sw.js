<<<<<<< HEAD
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("whisper-cache").then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./script.js",
        "./style.css",
        "./manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
=======
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("whisper-cache").then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./script.js",
        "./style.css",
        "./manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
>>>>>>> 091ada70bbc877fe5dc93ccbe290452efc803e6c
