self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // 基础 Service Worker，用于满足 PWA 安装条件
  e.respondWith(fetch(e.request));
});
