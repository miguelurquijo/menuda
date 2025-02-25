const CACHE_NAME = 'menuda-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/frontend/home.html',
    '/frontend/assets/css/styles.css',
    '/frontend/js/auth.js',
    '/frontend/js/app.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});