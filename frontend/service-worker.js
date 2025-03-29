const CACHE_NAME = 'menuda-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/frontend/home.html',
    '/frontend/transactions.html',
    '/frontend/budget.html',
    '/frontend/profile.html',
    '/frontend/transaction-detail.html',
    '/frontend/assets/css/styles.css',
    '/frontend/assets/css/navigation-menu.css',
    '/frontend/assets/css/quick-access.css',
    '/frontend/assets/css/transactions.css',
    '/frontend/assets/css/transaction-detail.css',
    '/frontend/assets/css/user-header.css',
    '/frontend/js/auth.js',
    '/frontend/js/app.js',
    '/frontend/js/transactions.js',
    '/frontend/js/transaction-detail.js',
    '/frontend/js/components/loadComponents.js',
    '/frontend/js/components/NavigationComponent.js',
    '/frontend/js/components/QuickAccessComponent.js',
    '/frontend/js/components/UserHeaderComponent.js',
    '/frontend/components/navigation-menu.html',
    '/frontend/components/quick-access.html',
    '/frontend/components/user-header.html',
    '/frontend/manifest.json'
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