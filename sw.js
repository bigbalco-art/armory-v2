const CACHE_NAME = 'armory-v2';
const ASSETS = [
  '/armory-v2/',
  '/armory-v2/index.html',
  '/armory-v2/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Never intercept these — must go directly to network
  if (url.includes('firebase') ||
      url.includes('googleapis') ||
      url.includes('generativelanguage') ||
      url.includes('firebaseapp.com') ||
      url.includes('accounts.google.com') ||
      url.includes('identitytoolkit') ||
      url.includes('securetoken') ||
      url.includes('api.anthropic.com')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
