/* R59 — SW EXTERMINADOR: o Center agora é APP (APK/EXE).
   Este service worker APAGA todos os caches antigos do Center e se remove.
   Ele serve NADA: depois dele, todo mundo recebe a versão atual direto da rede. */
const self2 = self;
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); })
      .then(function () { return self2.registration.unregister(); })
      .then(function () { return self2.clients.matchAll({ type: 'window' }); })
      .then(function (cs) { cs.forEach(function (c) { try { c.navigate(c.url); } catch (err) {} }); })
  );
});
self.addEventListener('fetch', function (e) { /* nada de cache: rede direta */ });
