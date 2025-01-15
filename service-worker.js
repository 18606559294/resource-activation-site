const CACHE_NAME = 'resource-activation-site-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/feedback.html',
  '/security.html',
  '/styles.css',
  '/js/app.js',
  '/js/modules/i18n.js',
  '/js/modules/animation.js',
  '/js/modules/websocket.js',
  '/js/modules/performance.js',
  '/js/modules/resource-loader.js'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
              return caches.delete(key);
            }
          })
        );
      }),
      // 立即接管所有页面
      self.clients.claim()
    ])
  );
});

// 处理请求
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // 忽略非 GET 请求
  if (request.method !== 'GET') {
    return;
  }

  // API 请求使用网络优先策略
  if (request.url.includes('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静态资源使用缓存优先策略
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 其他请求使用网络优先策略
  event.respondWith(networkFirst(request));
});

// 缓存优先策略
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  return fetchAndCache(request);
}

// 网络优先策略
async function networkFirst(request) {
  try {
    const response = await fetchAndCache(request);
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// 获取并缓存响应
async function fetchAndCache(request) {
  const response = await fetch(request);
  
  // 只缓存成功的响应
  if (response.ok) {
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
  }
  
  return response;
}

// 判断是否为静态资源
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset));
}

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-feedback') {
    event.waitUntil(syncFeedback());
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icon.png',
    badge: '/badge.png'
  };

  event.waitUntil(
    self.registration.showNotification('资源更新', options)
  );
});
