const CACHE_NAME = 'blogger-pwa-ua-cache-v1';
const urlsToCache = ['/'];

// Custom User Agent jeta tumi chaicho
const CUSTOM_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.0.0 Safari/53";

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// PWA thike joto request jabe, shobgulo-te User Agent header bodle jabe
self.addEventListener('fetch', event => {
  // Shudhu normal HTTP/HTTPS request gulo intercept korbo
  if (event.request.url.startsWith('http')) {
    
    // Notun headers toiri korchi purono headers gulo shoho
    const modifiedHeaders = new Headers(event.request.headers);
    
    // User-Agent custom ta set kore dewa holo
    modifiedHeaders.set('User-Agent', CUSTOM_USER_AGENT);
    modifiedHeaders.set('X-User-Agent', CUSTOM_USER_AGENT); // Kichu secure api r jonno safety mesh

    // Notun Request toiri holo modified header diye
    const modifiedRequest = new Request(event.request, {
      headers: modifiedHeaders,
      mode: event.request.mode === 'navigate' ? 'navigate' : event.request.mode,
      credentials: event.request.credentials,
      redirect: event.request.redirect
    });

    event.respondWith(
      fetch(modifiedRequest).catch(() => {
        return caches.match(event.request);
      })
    );
  } else {
    // Bakigulor jonno normal fetch
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});