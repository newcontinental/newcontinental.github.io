// 앱 껍데기만 저장해 두는 서비스워커 (그룹웨어 자료는 저장하지 않음)
const C = 'sdr-shell-v4';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png?v=2', './icon-512.png?v=2', './apple-touch-icon.png?v=2', './splash-mark.png?v=2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  // 새 버전을 먼저 받고, 인터넷이 안 되면 저장해 둔 껍데기를 보여 준다
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});

// ---------- 휴대폰 알림 ----------
self.addEventListener('push', e => {
  let m = {}; try { m = e.data ? e.data.json() : {}; } catch (x) { m = {}; }
  const d = m.data || m || {};
  const title = d.title || '신대륙물류 그룹웨어';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || '', icon: 'icon-192.png?v=2', badge: 'icon-192.png?v=2', tag: d.tag || undefined, renotify: !!d.tag,
    data: { go: d.go || '', v: d.v || '', id: d.id || '' }, vibrate: [120, 60, 120]
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const g = e.notification.data || {};
  const url = './' + (g.go ? '?go=' + encodeURIComponent(g.go) + '&v=' + encodeURIComponent(g.v || '') + '&id=' + encodeURIComponent(g.id || '') : '');
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const c = list.find(w => new URL(w.url).origin === location.origin);
    if (c) { if (g.go) c.postMessage({ sdrGo: g }); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
