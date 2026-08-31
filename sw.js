/* ==========================================================================
   ZEIK DIGITAL — Service Worker (PWA offline)
   - App shell em cache-first para os assets; HTML em network-first
     (assim uma atualização sua aparece na hora, e sem rede o painel abre igual)
   - NUNCA guarda dados de cliente em cache HTTP: os dados vivem no localStorage
   ========================================================================== */
var VERSION = "zeik-v3.1.0";
var SHELL = [
  "./",
  "./index.html",
  "./modelo-site.html",
  "./manifest.webmanifest",
  "./assets/css/style.css",
  "./assets/js/seed.js",
  "./assets/js/store.js",
  "./assets/js/site-template.js",
  "./assets/js/ui.js",
  "./assets/js/app.js",
  "./assets/js/modals.js",
  "./public/icons/icon-192.png",
  "./public/icons/icon-512.png",
  "./public/icons/icon-maskable-512.png",
  "./public/icons/icon.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) {
      // um asset ausente não pode impedir a instalação
      return Promise.all(SHELL.map(function (u) {
        return c.add(new Request(u, { cache: "reload" })).catch(function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // links externos (wa.me, maps) vão direto

  // Navegação: rede primeiro, cache como fallback (modo avião continua funcionando)
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put("./index.html", copy); });
        return res;
      }).catch(function () {
        return caches.match("./index.html").then(function (r) { return r || caches.match("./"); });
      })
    );
    return;
  }

  // Assets com extensão: cache primeiro
  if (/\.(css|js|png|jpg|jpeg|svg|webp|woff2?|manifest|ico)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
          return res;
        });
      })
    );
    return;
  }
});

self.addEventListener("message", function (e) {
  if (e.data === "skip-waiting") self.skipWaiting();
});
