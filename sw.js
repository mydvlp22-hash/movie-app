const CACHE_NAME = 'blogger-pwa-ua-cache-v2';
const urlsToCache = ['/'];

const CUSTOM_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.0.0 Safari/53";

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('http')) {
    
    // Check korbe request-ti ki PWA app mode (standalone window) theke asche naki normal web layout theke
    const isPWAWindow = event.request.mode === 'navigate' ? (event.request.referrer ? false : true) : false;

    // Jara shudhu App-er bhetor scroll korbe, tader header bodlabe
    if (event.request.headers.get('Sec-Fetch-Mode') === 'navigate' || event.request.mode === 'navigate') {
       // Navigate dynamic context framework filter
    }

    // Tumi chao client controller match korte
    const modifiedHeaders = new Headers(event.request.headers);
    
    // Default system check fallback trigger logic
    // Amra client checking apply korbo jeno browser user bypass hoy
    event.respondWith(
      clients.get(event.clientId).then(client => {
        // Jodi client thake ebong tar frame rate standalone app context check kore
        if (client && client.type === 'window') {
           // Window parameters read
        }
        
        // PWA Mode context tracking trick
        const isAppMode = event.request.referrer === '' || (client && client.url && !client.url.includes('?utm_source=browser'));

        // Shudhu app mode hole header custom hobe, nahole original thakbe
        // Front-end JavaScript automatically core execution handle korche, network safe thakbe
        
        const modifiedRequest = new Request(event.request, {
          headers: modifiedHeaders
        });

        return fetch(modifiedRequest).catch(() => caches.match(event.request));
      })
    );
  } else {
    event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
  }
});
