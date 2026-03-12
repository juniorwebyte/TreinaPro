// ============================================================================
// Service Worker - Treino PRO
// ============================================================================
// Gerencia cache offline, notificações push e sincronização em background
// ============================================================================

const CACHE_NAME = "treino-pro-v1";
const STATIC_CACHE = "treino-pro-static-v1";
const DYNAMIC_CACHE = "treino-pro-dynamic-v1";

// Arquivos essenciais para cache offline
const STATIC_ASSETS = [
  "/",
  "/treinar",
  "/exam-simulator",
  "/flashcards",
  "/dashboard",
  "/mapa-mental",
  "/collaborative",
  "/exam02",
  "/manifest.json",
  "/icon.svg",
];

// ============================================================================
// Instalação do Service Worker
// ============================================================================

self.addEventListener("install", (event) => {
  console.log("[SW] Instalando Service Worker...");
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Cacheando arquivos estáticos...");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Ativa imediatamente sem esperar
  self.skipWaiting();
});

// ============================================================================
// Ativação do Service Worker
// ============================================================================

self.addEventListener("activate", (event) => {
  console.log("[SW] Ativando Service Worker...");
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("[SW] Removendo cache antigo:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Assume controle de todas as páginas
  self.clients.claim();
});

// ============================================================================
// Interceptação de Requisições (Fetch)
// ============================================================================

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora requisições para outras origens
  if (url.origin !== location.origin) {
    return;
  }
  
  // Estratégia: Network First com fallback para cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone a resposta antes de cachear
        const responseClone = response.clone();
        
        // Cacheia dinamicamente páginas visitadas
        if (request.method === "GET" && response.status === 200) {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Fallback para cache se offline
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Página offline de fallback
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          
          return new Response("Offline", { status: 503 });
        });
      })
  );
});

// ============================================================================
// Notificações Push
// ============================================================================

self.addEventListener("push", (event) => {
  console.log("[SW] Push recebido:", event);
  
  let data = {
    title: "Treino PRO",
    body: "Hora de estudar!",
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: "treino-reminder",
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "Abrir App",
      },
      {
        action: "dismiss",
        title: "Dispensar",
      },
    ],
    requireInteraction: false,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================================================
// Clique em Notificação
// ============================================================================

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notificação clicada:", event);
  
  event.notification.close();
  
  if (event.action === "dismiss") {
    return;
  }
  
  const url = event.notification.data?.url || "/";
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Se já tem uma janela aberta, foca nela
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Senão, abre uma nova janela
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ============================================================================
// Sincronização em Background
// ============================================================================

self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);
  
  if (event.tag === "sync-progress") {
    event.waitUntil(syncProgress());
  }
});

async function syncProgress() {
  // Sincroniza dados quando volta online
  console.log("[SW] Sincronizando progresso...");
  
  // Aqui seria a lógica de sincronização com backend
  // Por enquanto apenas log
  return Promise.resolve();
}

// ============================================================================
// Mensagens do Cliente
// ============================================================================

self.addEventListener("message", (event) => {
  console.log("[SW] Mensagem recebida:", event.data);
  
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  
  if (event.data.type === "CACHE_URLS") {
    const urls = event.data.payload;
    caches.open(DYNAMIC_CACHE).then((cache) => {
      cache.addAll(urls);
    });
  }
  
  if (event.data.type === "CLEAR_CACHE") {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    });
  }
});
