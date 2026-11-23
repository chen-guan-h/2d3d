// 離線快取：網頁本身與 cdn.jsdelivr.net 上的程式庫（three.js、transformers.js、ONNX 執行檔）
// AI 模型檔由 transformers.js 自己存在 'transformers-cache'，不經過這裡
const C = 'img3d-v1';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html'])).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('img3d-') && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const same = u.origin === location.origin, cdn = u.hostname === 'cdn.jsdelivr.net';
  if (!same && !cdn) return;
  if (same) {   // 網頁：先連網拿新版，沒網路時用快取
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
    return;
  }
  // 程式庫（網址含版本號，不會變）：先用快取
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(r2 => { if (r2.ok) { const cp = r2.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r2; })));
});
