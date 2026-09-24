const CACHE="jovel-app-v5";
const ASSETS=["./", "./index.html", "./app.css", "./app.js", "./manifest.webmanifest", "./assets/icon.svg", "./assets/floor-1-hub.svg", "./data/events.json", "./data/ideas.json", "./data/projects.json", "./data/links.json", "./data/skills.json", "./data/rooms.json"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(k=>k.put(e.request,x));return r}).catch(()=>caches.match("./index.html"))))});
