const CACHE_NAME = 'alfatih-v1';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('script.google.com') || e.request.url.includes('googleapis.com')) {
    return; // Always fetch GAS/Sheets from network
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
