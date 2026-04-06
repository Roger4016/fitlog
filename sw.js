var CACHE = 'fitlog-v24';
var UPDATE_TYPE = 'safe'; // 'silent' | 'safe' | 'data'
var URLS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

// API 網域：不快取，直接走網路
function isApiRequest(url) {
  return url.indexOf('generativelanguage.googleapis.com') > -1 ||
         url.indexOf('www.googleapis.com') > -1 ||
         url.indexOf('accounts.google.com') > -1;
}

// CDN 靜態資源（版本化）：cache-first，首次載入後快取
function isCdnResource(url) {
  return url.indexOf('cdnjs.cloudflare.com') > -1 ||
         url.indexOf('unpkg.com') > -1 ||
         url.indexOf('fonts.googleapis.com') > -1 ||
         url.indexOf('fonts.gstatic.com') > -1;
}

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(URLS); }));
});

self.addEventListener('message', function(e) {
  if (!e.data) return;
  if (e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data.type === 'GET_UPDATE_TYPE' && e.source && e.source.postMessage) {
    e.source.postMessage({ type: 'UPDATE_TYPE', value: UPDATE_TYPE });
  }
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;

  // API 請求：不干預，直接走網路（避免快取敏感 token 或動態回應）
  if (isApiRequest(url)) return;

  // CDN 靜態資源：cache-first（版本固定，快取後永遠有效；離線也能使用）
  if (isCdnResource(url)) {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        if (cached) return cached;
        return fetch(e.request).then(function(response) {
          if (response.ok) {
            caches.open(CACHE).then(function(c) { c.put(e.request, response.clone()); });
          }
          return response;
        }).catch(function() { return cached; });
      })
    );
    return;
  }

  // App Shell（HTML、icon、manifest）：network-first，確保更新；失敗時回 cache
  e.respondWith(
    fetch(e.request).then(function(response) {
      if (response.ok) {
        caches.open(CACHE).then(function(c) { c.put(e.request, response.clone()); });
      }
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
