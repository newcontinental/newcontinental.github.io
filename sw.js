// 앱 껍데기만 저장해 두는 서비스워커 (그룹웨어 자료는 저장하지 않음)
const C = 'sdr-shell-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png?v=2', './icon-512.png?v=2', './apple-touch-icon.png?v=2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  // 새 버전을 먼저 받고, 인터넷이 안 되면 저장해 둔 껍데기를 보여 준다
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
