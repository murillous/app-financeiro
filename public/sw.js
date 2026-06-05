// Fetch listener mínimo — obrigatório para o Chrome habilitar instalação PWA
// Estratégia NetworkFirst: sempre busca da rede, cache como fallback offline

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
