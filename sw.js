const CACHE_NAME = 'dylan-portfolio-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/projects.html',
    '/contact.html',
    '/resume.html',
    '/main.css',
    '/normalize.css',
    '/projects.js',
    '/contact.js',
    '/script.js',
    '/profile.jpg',
    '/placeholder.png'
];

// Cache Assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching App Shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Cache is first Policy for assets, Network is first for API requests
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // Bypass cache for security-sensitive API endpoints
    if (url.pathname.startsWith('/api/')) {
        e.respondWith(
            fetch(e.request).catch(() => {
                // If offline fallback to cached JSON
                return caches.match('/api/projects');
            })
        );
        return;
    }

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            
            return fetch(e.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200) return networkResponse;
                
                // cache newly discovered  assets
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, responseToCache);
                });
                return networkResponse;
            });
        })
    );
});

// Push Notification Event
self.addEventListener('push', (e) => {
    const data = e.data ? e.data.json() : { title: 'Portfolio Update', body: 'New changes are live!' };
    
    const options = {
        body: data.body,
        icon: '/profile.jpg',
        badge: '/profile.jpg',
        vibrate: [100, 50, 100],
        data: { primaryKey: 1 }
    };

    e.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});