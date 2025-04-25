
const CACHE_NAME = 'mindgrove-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '//mindgrove.png',
  '/document-icons/doc-icon.svg',
  '/document-icons/pdf-icon.svg',
  '/document-icons/ppt-icon.svg',
  '/document-icons/txt-icon.svg',
  '/document-icons/xls-icon.svg',
  '/document-icons/image-icon.svg',
  '/document-icons/generic-icon.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache if available, otherwise fetch from network and cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests like API calls to Supabase or OpenRouter
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response as it can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        );
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '//mindgrove.png',
    badge: '//mindgrove.png'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
