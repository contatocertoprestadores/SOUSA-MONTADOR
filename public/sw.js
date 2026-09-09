
const CACHE_NAME = 'sousa-v4-fix';
const ASSETS = ['/','/manifest.json','/icons/icon-192.png','/icons/icon-512.png'];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  const url = new URL(req.url);

  // Skip non-GET and chrome extensions
  if(req.method !== 'GET' || url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // For navigation (pages) - network first, fallback to cache
  if(req.mode === 'navigate'){
    e.respondWith(
      fetch(req).then(res=>{
        const clone=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(req, clone));
        return res;
      }).catch(()=>caches.match(req).then(r=> r || caches.match('/')))
    );
    return;
  }

  // For assets - cache first, network fallback
  e.respondWith(
    caches.match(req).then(cached=>{
      if(cached) return cached;
      return fetch(req).then(res=>{
        // Cache successful responses
        if(res && res.status===200 && res.type==='basic'){
          const clone=res.clone();
          caches.open(CACHE_NAME).then(c=>c.put(req, clone));
        }
        return res;
      });
    })
  );
});
