/**
 * PMP Service Worker
 * 
 * Handles offline caching and background sync for the PMP WordPress site
 */

const CACHE_NAME = 'pmp-cache-v1';
const STATIC_CACHE = 'pmp-static-v1';
const DYNAMIC_CACHE = 'pmp-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/dashboard/',
    '/resources/',
    '/wp-content/themes/understrap-child-1.2.0/assets/css/pmp-components.css',
    '/wp-content/themes/understrap-child-1.2.0/assets/js/navigation.js',
    '/wp-content/themes/understrap-child-1.2.0/assets/js/dashboard.js',
    '/wp-content/themes/understrap-child-1.2.0/assets/js/lazy-loading.js',
    'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&display=swap'
];

// Cache strategies for different content types
const CACHE_STRATEGIES = {
    // Static assets - cache first
    static: /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
    
    // API endpoints - network first with cache fallback
    api: /\/wp-admin\/admin-ajax\.php/,
    
    // Pages - stale while revalidate
    pages: /\/(dashboard|resources|lesson|course)/,
    
    // Images - cache first with network fallback
    images: /\.(png|jpg|jpeg|gif|svg|webp)$/
};

/**
 * Install event - cache static files
 */
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static files...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static files:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - handle requests with appropriate caching strategy
 */
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Determine caching strategy
    if (CACHE_STRATEGIES.static.test(url.pathname)) {
        event.respondWith(cacheFirst(request));
    } else if (CACHE_STRATEGIES.api.test(url.pathname)) {
        event.respondWith(networkFirstWithCache(request));
    } else if (CACHE_STRATEGIES.pages.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(request));
    } else if (CACHE_STRATEGIES.images.test(url.pathname)) {
        event.respondWith(cacheFirstWithNetworkFallback(request));
    } else {
        event.respondWith(networkFirstWithCache(request));
    }
});

/**
 * Cache First Strategy
 * Good for static assets that rarely change
 */
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Network First with Cache Fallback
 * Good for API calls and dynamic content
 */
async function networkFirstWithCache(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/offline.html') || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable'
            });
        }
        
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Stale While Revalidate
 * Good for pages that should be fast but can be updated in background
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await caches.match(request);
    
    // Fetch from network in background
    const networkResponsePromise = fetch(request)
        .then(networkResponse => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(error => {
            console.log('Background fetch failed:', error);
        });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Otherwise wait for network
    return networkResponsePromise;
}

/**
 * Cache First with Network Fallback
 * Good for images and media files
 */
async function cacheFirstWithNetworkFallback(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            
            // Only cache successful responses
            if (networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
            }
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Image caching failed:', error);
        
        // Return placeholder image for failed image requests
        if (request.destination === 'image') {
            return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">' +
                '<rect width="200" height="150" fill="#f0f0f0"/>' +
                '<text x="100" y="75" text-anchor="middle" fill="#999">Image unavailable</text>' +
                '</svg>',
                {
                    headers: {
                        'Content-Type': 'image/svg+xml'
                    }
                }
            );
        }
        
        return new Response('Resource not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Background Sync for form submissions and data updates
 */
self.addEventListener('sync', event => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'pmp-progress-sync') {
        event.waitUntil(syncProgressData());
    } else if (event.tag === 'pmp-activity-sync') {
        event.waitUntil(syncActivityData());
    }
});

/**
 * Sync progress data when back online
 */
async function syncProgressData() {
    try {
        // Get stored progress data from IndexedDB
        const progressData = await getStoredProgressData();
        
        if (progressData && progressData.length > 0) {
            for (const data of progressData) {
                await fetch('/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'pmp_sync_progress',
                        ...data
                    })
                });
            }
            
            // Clear stored data after successful sync
            await clearStoredProgressData();
            console.log('Progress data synced successfully');
        }
    } catch (error) {
        console.error('Failed to sync progress data:', error);
    }
}

/**
 * Sync activity data when back online
 */
async function syncActivityData() {
    try {
        // Similar to progress sync but for activity data
        const activityData = await getStoredActivityData();
        
        if (activityData && activityData.length > 0) {
            for (const data of activityData) {
                await fetch('/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'pmp_sync_activity',
                        ...data
                    })
                });
            }
            
            await clearStoredActivityData();
            console.log('Activity data synced successfully');
        }
    } catch (error) {
        console.error('Failed to sync activity data:', error);
    }
}

/**
 * IndexedDB helpers for offline data storage
 */
async function getStoredProgressData() {
    // Simplified - would need proper IndexedDB implementation
    return [];
}

async function clearStoredProgressData() {
    // Clear progress data from IndexedDB
}

async function getStoredActivityData() {
    // Get activity data from IndexedDB
    return [];
}

async function clearStoredActivityData() {
    // Clear activity data from IndexedDB
}

/**
 * Push notification handling
 */
self.addEventListener('push', event => {
    if (!event.data) {
        return;
    }
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/wp-content/themes/understrap-child-1.2.0/images/icon-192x192.png',
        badge: '/wp-content/themes/understrap-child-1.2.0/images/badge-72x72.png',
        tag: data.tag || 'pmp-notification',
        data: data.url ? { url: data.url } : undefined,
        actions: data.actions || []
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

/**
 * Message handling from main thread
 */
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE)
                .then(cache => cache.addAll(event.data.urls))
        );
    }
});

/**
 * Periodic background sync for cache cleanup
 */
self.addEventListener('periodicsync', event => {
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(cleanupOldCaches());
    }
});

/**
 * Clean up old cache entries
 */
async function cleanupOldCaches() {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
            const dateHeader = response.headers.get('date');
            if (dateHeader) {
                const responseDate = new Date(dateHeader).getTime();
                if (now - responseDate > maxAge) {
                    await cache.delete(request);
                }
            }
        }
    }
    
    console.log('Cache cleanup completed');
}