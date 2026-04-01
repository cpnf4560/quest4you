/**
 * Quest4You - Service Worker
 * PWA offline support e caching
 * @fileoverview Service Worker para funcionalidade offline
 */

const CACHE_NAME = 'quest4you-v2.1.1';
const OFFLINE_URL = '/offline.html';

// Assets a pre-cachear imediatamente
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/main.css',
  '/css/quiz.css',
  '/css/dark-mode.css',
  '/js/app.js',
  '/js/i18n.js',
  '/js/utils.js',
  '/js/toast.js',
  '/js/error-handler.js',
  '/assets/quest4you_transp.png',
  '/i18n/pt.json',
  '/i18n/en.json',
  '/i18n/es.json',
  '/manifest.json'
];

// Recursos que devem sempre vir da rede
const NETWORK_ONLY = [
  '/api/',
  'firestore.googleapis.com',
  'firebase',
  'googleapis.com',
  'gstatic.com',
  'clarity.ms'
];

// ================================
// INSTALL EVENT
// ================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v' + CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Pre-cache complete');
        return self.skipWaiting(); // Ativar imediatamente
      })
      .catch((error) => {
        console.error('[SW] Pre-cache failed:', error);
      })
  );
});

// ================================
// ACTIVATE EVENT
// ================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// ================================
// FETCH EVENT
// ================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar requests não-GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar recursos que devem vir da rede
  if (NETWORK_ONLY.some(pattern => url.href.includes(pattern))) {
    return;
  }
  
  // Ignorar chrome-extension e outros protocolos
  if (!url.protocol.startsWith('http')) return;
  
  event.respondWith(handleFetch(event.request));
});

/**
 * Estratégia de fetch: Stale-While-Revalidate para HTML/CSS/JS
 * Cache-First para assets estáticos
 */
async function handleFetch(request) {
  try {
    const url = new URL(request.url);
    
    // Para navegação (HTML), usar network-first
    if (request.mode === 'navigate') {
      const response = await networkFirst(request);
      if (response) return response;
    }
    
    // Para assets estáticos, usar cache-first
    if (isStaticAsset(url)) {
      const response = await cacheFirst(request);
      if (response) return response;
    }
    
    // Para outros recursos, usar stale-while-revalidate
    const response = await staleWhileRevalidate(request);
    if (response) return response;
    
    // Fallback: tentar fetch direto
    return fetch(request);
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    // Retornar resposta de erro genérica
    return new Response('Service Unavailable', { 
      status: 503, 
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Verifica se é um asset estático
 */
function isStaticAsset(url) {
  const staticExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

/**
 * Network First - tenta rede, fallback para cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Se sucesso, guardar em cache e retornar
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network falhou, tentar cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se é navegação e não há cache, mostrar página offline
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    
    throw error;
  }
}

/**
 * Cache First - tenta cache, fallback para rede
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Retornar resposta vazia para assets não críticos
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Stale While Revalidate - retorna cache imediatamente, atualiza em background
 */
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Se temos cache, retornar imediatamente e atualizar em background
  if (cachedResponse) {
    // Atualizar cache em background (não esperamos)
    fetch(request.clone())
      .then(async (networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse);
        }
      })
      .catch(() => {}); // Ignorar erros de background fetch
    
    return cachedResponse;
  }
  
  // Sem cache, fazer fetch e guardar
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

// ================================
// PUSH NOTIFICATIONS
// ================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: 'Quest4You',
    body: 'Nova notificação',
    icon: '/assets/quest4you_transp.png',
    badge: '/assets/quest4you_transp.png'
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
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: data.actions || [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ],
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ================================
// NOTIFICATION CLICK
// ================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Verificar se já existe uma janela aberta
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            return client.navigate(urlToOpen);
          }
        }
        // Senão, abrir nova janela
        return clients.openWindow(urlToOpen);
      })
  );
});

// ================================
// BACKGROUND SYNC
// ================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-quiz-progress') {
    event.waitUntil(syncQuizProgress());
  }
});

async function syncQuizProgress() {
  // Tentar sincronizar progresso guardado localmente
  try {
    const cache = await caches.open(CACHE_NAME + '-pending');
    const keys = await cache.keys();
    
    for (const request of keys) {
      const response = await cache.match(request);
      const data = await response.json();
      
      // Enviar para servidor
      await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Remover do cache pendente
      await cache.delete(request);
    }
    
    console.log('[SW] Background sync complete');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    throw error; // Para retry
  }
}

// ================================
// PERIODIC SYNC
// ================================

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  // Atualizar traduções e dados dos quizzes
  try {
    const cache = await caches.open(CACHE_NAME);
    
    const urls = [
      '/i18n/pt.json',
      '/i18n/en.json',
      '/i18n/es.json',
      '/data/quizzes/index.json'
    ];
    
    for (const url of urls) {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    }
    
    console.log('[SW] Periodic content update complete');
  } catch (error) {
    console.error('[SW] Periodic update failed:', error);
  }
}

// ================================
// MESSAGE HANDLER
// ================================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service Worker loaded - version:', CACHE_NAME);
