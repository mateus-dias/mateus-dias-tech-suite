const CACHE = 'md-public-v1';
const staticURL = (u) => u.origin === self.location.origin && !u.search && (u.pathname.startsWith('/assets/') || ['/app-icon.svg','/manifest.webmanifest','/favicon.ico'].includes(u.pathname));
self.addEventListener('install', event => {
 event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(['/','/app-icon.svg','/manifest.webmanifest']);})());
});
self.addEventListener('activate', event => {event.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith('md-public-')&&key!==CACHE)await caches.delete(key);}await self.clients.claim();})());});
self.addEventListener('message', event => {
 if(event.data?.type!=='CACHE_PUBLIC_ASSETS'||!Array.isArray(event.data.urls))return;
 event.waitUntil((async()=>{const cache=await caches.open(CACHE);await Promise.allSettled(event.data.urls.slice(0,80).filter(s=>typeof s==='string').map(async s=>{const u=new URL(s,self.location.origin);if(staticURL(u)){const r=await fetch(u.href);if(r.ok&&!r.headers.get('content-type')?.includes('text/html'))await cache.put(u.href,r);}}));})());
});
self.addEventListener('fetch', event => {
 const req=event.request;const url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 // Never cache admin screens, proposals, API requests, authentication or Supabase responses.
 if(req.mode==='navigate'){
  if(url.pathname!=='/'||url.search)return;
  event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(req);if(response.ok)await cache.put('/',response.clone());return response;}catch{const saved=await cache.match('/');return saved||new Response('Sem conexão. Acesse o site uma vez com internet para disponibilizá-lo offline.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());return;
 }
 if(!staticURL(url))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);const saved=await cache.match(req);if(saved)return saved;const response=await fetch(req);if(response.ok&&!response.headers.get('content-type')?.includes('text/html'))await cache.put(req,response.clone());return response;})());
});
