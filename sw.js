/**
 * GALAXY PIANO - SERVICE WORKER
 * PWA Service Worker para caché y offline functionality
 * Sprint 5 - v1.0 Release
 */

const CACHE_NAME = 'galaxy-piano-v1.0.0';
const DATA_CACHE_NAME = 'galaxy-piano-data-v1.0.0';

// Archivos críticos para caché
const CORE_FILES = [
    './',
    './index.html',
    './manifest.json',
    
    // CSS
    './styles/main.css',
    './styles/galaxy.css', 
    './styles/components.css',
    './styles/composer.css',
    './styles/analysis.css',
    './styles/polish.css',
    
    // JavaScript Core
    './scripts/main.js',
    './scripts/utils/helpers.js',
    './scripts/utils/uiManager.js',
    './scripts/audio/noteMapping.js',
    './scripts/audio/audioEngine.js',
    
    // Visual System
    './scripts/visual/galaxyRenderer.js',
    './scripts/visual/starSystem.js',
    './scripts/visual/waves2D.js',
    './scripts/visual/spectrum3D.js',
    
    // Composer System
    './scripts/composer/sequencer.js',
    './scripts/composer/musicTheory.js',
    './scripts/composer/projectManager.js',
    
    // File System
    './scripts/utils/fileManager.js',
    
    // CDN Libraries
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js'
];

// Archivos opcionales (se cargan si están disponibles)
const OPTIONAL_FILES = [
    './assets/icons/icon-192x192.png',
    './assets/icons/icon-512x512.png',
    './assets/screenshots/live-mode.jpg',
    './assets/screenshots/composer-mode.jpg',
    './assets/screenshots/analysis-mode.jpg'
];

// URLs que necesitan network-first strategy
const NETWORK_FIRST_URLS = [
    '/api/',
    'https://cdnjs.cloudflare.com/'
];

/**
 * Evento de instalación
 */
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando v1.0.0');
    
    event.waitUntil(
        Promise.all([
            // Caché crítico
            caches.open(CACHE_NAME).then((cache) => {
                console.log('📦 Cacheando archivos críticos...');
                return cache.addAll(CORE_FILES);
            }),
            
            // Caché opcional (no bloquea instalación)
            caches.open(CACHE_NAME).then((cache) => {
                console.log('📦 Cacheando archivos opcionales...');
                return Promise.allSettled(
                    OPTIONAL_FILES.map(file => 
                        cache.add(file).catch(err => 
                            console.warn('⚠️ No se pudo cachear:', file)
                        )
                    )
                );
            })
        ]).then(() => {
            console.log('✅ Service Worker instalado correctamente');
            return self.skipWaiting();
        })
    );
});

/**
 * Evento de activación
 */
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activando v1.0.0');
    
    event.waitUntil(
        Promise.all([
            // Limpiar cachés antiguos
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                            console.log('🗑️ Eliminando caché antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Tomar control de todas las páginas
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker activado');
        })
    );
});

/**
 * Interceptar fetch requests
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-HTTP requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Strategy para diferentes tipos de requests
    if (request.method === 'GET') {
        if (isNetworkFirstUrl(request.url)) {
            event.respondWith(networkFirst(request));
        } else if (isApiRequest(request.url)) {
            event.respondWith(networkFirst(request));
        } else if (isStaticAsset(request.url)) {
            event.respondWith(cacheFirst(request));
        } else {
            event.respondWith(staleWhileRevalidate(request));
        }
    }
});

/**
 * Verificar si URL necesita network-first
 */
function isNetworkFirstUrl(url) {
    return NETWORK_FIRST_URLS.some(pattern => url.includes(pattern));
}

/**
 * Verificar si es request de API
 */
function isApiRequest(url) {
    return url.includes('/api/') || url.includes('api.');
}

/**
 * Verificar si es asset estático
 */
function isStaticAsset(url) {
    return /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i.test(url);
}

/**
 * Strategy: Cache First
 * Para assets estáticos que no cambian
 */
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        // Cachear si la respuesta es válida
        if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('🚨 Error en cache-first:', error);
        
        // Fallback offline
        if (request.destination === 'document') {
            return cache.match('./index.html');
        }
        
        throw error;
    }
}

/**
 * Strategy: Network First
 * Para contenido que debe estar actualizado
 */
async function networkFirst(request) {
    const cache = await caches.open(DATA_CACHE_NAME);
    
    try {
        const networkResponse = await fetch(request);
        
        // Cachear respuesta exitosa
        if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.warn('⚠️ Network falló, usando caché:', request.url);
        
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Strategy: Stale While Revalidate
 * Para contenido que puede estar levemente desactualizado
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch en background para actualizar caché
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch((error) => {
        console.warn('⚠️ Background fetch falló:', request.url);
    });
    
    // Devolver caché inmediatamente si existe, sino esperar network
    if (cachedResponse) {
        return cachedResponse;
    }
    
    return fetchPromise;
}

/**
 * Manejar mensajes del cliente
 */
self.addEventListener('message', (event) => {
    const { data } = event;
    
    switch (data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({
                version: CACHE_NAME,
                coreFiles: CORE_FILES.length,
                optionalFiles: OPTIONAL_FILES.length
            });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'CACHE_URLS':
            if (data.urls && Array.isArray(data.urls)) {
                cacheUrls(data.urls).then(() => {
                    event.ports[0].postMessage({ success: true });
                });
            }
            break;
    }
});

/**
 * Limpiar todos los cachés
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('🧹 Todos los cachés eliminados');
}

/**
 * Cachear URLs específicas
 */
async function cacheUrls(urls) {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(
        urls.map(url => 
            cache.add(url).catch(err => 
                console.warn('⚠️ No se pudo cachear:', url, err)
            )
        )
    );
    console.log('📦 URLs adicionales cacheadas');
}

/**
 * Manejar notificaciones push (futuro)
 */
self.addEventListener('push', (event) => {
    console.log('📬 Push recibido:', event);
    
    const options = {
        body: 'Nueva actualización disponible en Galaxy Piano',
        icon: './assets/icons/icon-192x192.png',
        badge: './assets/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '🌌 Explorar',
                icon: './assets/icons/action-explore.png'
            },
            {
                action: 'close',
                title: '❌ Cerrar',
                icon: './assets/icons/action-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Galaxy Piano', options)
    );
});

/**
 * Manejar clicks en notificaciones
 */
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notificación clickeada:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

/**
 * Sync en background (para futuras features)
 */
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Implementar sync de proyectos o configuraciones
            console.log('⚙️ Background sync completado')
        );
    }
});

/**
 * Manejo de compartir archivos
 */
self.addEventListener('share', (event) => {
    console.log('📤 Archivo compartido:', event);
    
    event.waitUntil(
        // Procesar archivo compartido
        clients.openWindow('./?shared=true')
    );
});

/**
 * Información de versión y estado
 */
console.log(`
🌌 Galaxy Piano Service Worker v1.0.0
📦 Archivos críticos: ${CORE_FILES.length}
📦 Archivos opcionales: ${OPTIONAL_FILES.length}
🔧 Strategies: cache-first, network-first, stale-while-revalidate
✨ Features: PWA, offline, push notifications, file sharing
`);

// Export para testing (si está disponible)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CACHE_NAME,
        DATA_CACHE_NAME,
        CORE_FILES,
        OPTIONAL_FILES,
        cacheFirst,
        networkFirst,
        staleWhileRevalidate
    };
}