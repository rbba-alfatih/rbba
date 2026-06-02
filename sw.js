// ============================================================
//  SERVICE WORKER - alfatih
//  Strategi: Network First + Auto Cache Update
//  Ganti versi CACHE_NAME setiap kali deploy baru
// ============================================================

const CACHE_NAME = 'alfatih-v2';

const ASSETS = [
  './',
  './index.html',
];

// ============================================================
//  INSTALL — Cache aset utama
// ============================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // Langsung aktif tanpa menunggu tab lama ditutup
  self.skipWaiting();
});

// ============================================================
//  ACTIVATE — Hapus cache versi lama
// ============================================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  // Ambil kendali semua tab/WebView sekarang juga
  self.clients.claim();
});

// ============================================================
//  FETCH — Network First, fallback ke Cache (offline)
// ============================================================
self.addEventListener('fetch', event => {

  // Google Apps Script & Sheets → selalu dari network, tidak di-cache
  if (
    event.request.url.includes('script.google.com') ||
    event.request.url.includes('googleapis.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Aset lain → coba network dulu
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Simpan versi terbaru ke cache
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // Offline: ambil dari cache sebagai fallback
        return caches.match(event.request);
      })
  );
});
