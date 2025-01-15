// 资源加载优化模块
class ResourceLoader {
  constructor() {
    this.resourceCache = new Map();
    this.loadingPromises = new Map();
    this.intersectionObserver = this.createIntersectionObserver();
  }

  createIntersectionObserver() {
    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          if (element.dataset.src) {
            this.loadResource(element);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });
  }

  // 懒加载图片
  lazyLoadImage(imgElement) {
    if (!imgElement.dataset.src) {
      return;
    }
    this.intersectionObserver.observe(imgElement);
  }

  // 预加载关键资源
  preloadCriticalResources() {
    const criticalResources = [
      '/styles.css',
      '/js/app.js',
      '/js/modules/i18n.js'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = this.getResourceType(resource);
      document.head.appendChild(link);
    });
  }

  // 获取资源类型
  getResourceType(resource) {
    const ext = resource.split('.').pop();
    const typeMap = {
      css: 'style',
      js: 'script',
      png: 'image',
      jpg: 'image',
      jpeg: 'image',
      gif: 'image',
      woff2: 'font',
      woff: 'font'
    };
    return typeMap[ext] || 'fetch';
  }

  // 加载资源
  async loadResource(element) {
    const url = element.dataset.src;
    
    // 检查缓存
    if (this.resourceCache.has(url)) {
      this.applyResource(element, this.resourceCache.get(url));
      return;
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(url)) {
      const resource = await this.loadingPromises.get(url);
      this.applyResource(element, resource);
      return;
    }

    // 开始新的加载
    const loadPromise = fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        this.resourceCache.set(url, objectUrl);
        this.loadingPromises.delete(url);
        return objectUrl;
      });

    this.loadingPromises.set(url, loadPromise);
    
    try {
      const resource = await loadPromise;
      this.applyResource(element, resource);
    } catch (error) {
      console.error('Failed to load resource:', error);
      this.loadingPromises.delete(url);
    }
  }

  // 应用资源到元素
  applyResource(element, resource) {
    if (element instanceof HTMLImageElement) {
      element.src = resource;
    } else if (element instanceof HTMLVideoElement) {
      element.src = resource;
    }
    // 可以根据需要添加其他类型的元素处理
  }

  // 清理资源
  cleanup() {
    this.resourceCache.forEach(objectUrl => {
      URL.revokeObjectURL(objectUrl);
    });
    this.resourceCache.clear();
    this.intersectionObserver.disconnect();
  }
}

export const resourceLoader = new ResourceLoader();
export default resourceLoader;
