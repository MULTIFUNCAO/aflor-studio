const CACHE_NAME = 'aflor-studio-v3';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  var url = new URL(event.request.url);

  // Passa direto sem cache: APIs externas (Supabase, CDNs, backend)
  if (url.origin !== self.location.origin) return;

  // Navegação (o documento HTML principal): ignora o cache HTTP de 10min do GitHub
  // Pages e sempre revalida com o servidor, pra deploys aparecerem na hora.
  var fetchReq = event.request.mode === 'navigate'
    ? new Request(event.request, {cache: 'reload'})
    : event.request;

  event.respondWith(
    fetch(fetchReq).then(function(response) {
      if (response && response.status === 200) {
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
