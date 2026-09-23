/* =====================================================
   NOVA STOCK
   SERVICE WORKER - PWA
===================================================== */

const CACHE_NAME = "nova-stock-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json"
];


/* =========================
   INSTALLATION
========================= */

self.addEventListener("install", event => {

    console.log("NOVA STOCK : installation du Service Worker");

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })

    );

    self.skipWaiting();

});


/* =========================
   ACTIVATION
========================= */

self.addEventListener("activate", event => {

    console.log("NOVA STOCK : Service Worker activé");

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(
                            name =>
                                name !== CACHE_NAME
                        )
                        .map(
                            name =>
                                caches.delete(name)
                        )

                );

            })

    );

    self.clients.claim();

});


/* =========================
   RÉCUPÉRATION DES FICHIERS
========================= */

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {

                    return cachedResponse;

                }

                return fetch(event.request)
                    .then(response => {

                        if (
                            !response ||
                            response.status !== 200 ||
                            response.type !== "basic"
                        ) {

                            return response;

                        }

                        const responseClone =
                            response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });

                        return response;

                    })
                    .catch(() => {

                        return caches.match(
                            "./index.html"
                        );

                    });

            })

    );

});