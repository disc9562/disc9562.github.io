const CACHE = 'dnd5e-pwa-v66'
const ASSETS = [
  './',
  './index.html',
  './css/app.css',
  './js/rules.js',
  './js/store.js',
  './js/tag-icons.js',
  './js/app.js',
  './data/races.json',
  './data/classes.json',
  './data/spells.json',
  './data/feats.json',
  './data/features.json',
  './data/races2024.json',
  './data/classes2024.json',
  './data/choices.json',
  './data/equipment.json',
  './data/prepared.json',
  './data/subclass-features.json',
  './data/magic-items.json',
  './data/backgrounds2024.json',
  './data/scripts/avernus.json',
  './icon.svg',
  './manifest.webmanifest'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const req = event.request
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone()
        caches.open(CACHE).then(cache => cache.put(req, copy))
        return res
      }).catch(() => caches.match('./index.html'))
    )
    return
  }
  event.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit
      return fetch(req).then(res => {
        const copy = res.clone()
        caches.open(CACHE).then(cache => cache.put(req, copy))
        return res
      }).catch(() => caches.match('./index.html'))
    })
  )
})
