// 资源预加载管理器
class ResourcePreloader {
    /** @type {Set<string>} */
    private loadedResources;
    /** @type {Map<string, Promise<void>>} */
    private loadingPromises;
    /** @type {number} */
    private maxConcurrent = 5;
    /** @type {number} */
    private loadingCount = 0;
    /** @type {string[]} */
    private queue;

    constructor() {
        this.loadedResources = new Set();
        this.loadingPromises = new Map();
        this.queue = [];
    }

    /**
     * 预加载资源
     * @param {string[]} urls 资源URL列表
     * @param {Object} options 预加载选项
     * @param {string} [options.priority='low'] 预加载优先级
     * @returns {Promise<void>}
     */
    async preload(urls, options = { priority: 'low' }) {
        const uniqueUrls = urls.filter(url => !this.loadedResources.has(url));

        if (uniqueUrls.length === 0) {
            return;
        }

        if (options.priority === 'high') {
            // 高优先级资源立即加载
            await Promise.all(uniqueUrls.map(url => this.loadResource(url)));
        } else {
            // 低优先级资源加入队列
            this.queue.push(...uniqueUrls);
            this.processQueue();
        }
    }

    /**
     * 处理加载队列
     * @private
     */
    private async processQueue() {
        while (this.queue.length > 0 && this.loadingCount < this.maxConcurrent) {
            const url = this.queue.shift();
            if (url && !this.loadedResources.has(url)) {
                this.loadingCount++;
                try {
                    await this.loadResource(url);
                } finally {
                    this.loadingCount--;
                    this.processQueue();
                }
            }
        }
    }

    /**
     * 加载单个资源
     * @param {string} url 资源URL
     * @returns {Promise<void>}
     * @private
     */
    private loadResource(url): Promise<void> {
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }

        const promise = new Promise<void>((resolve, reject) => {
            const extension = url.split('.').pop().toLowerCase();

            switch (extension) {
                case 'js':
                    this.loadScript(url).then(resolve).catch(reject);
                    break;
                case 'css':
                    this.loadStylesheet(url).then(resolve).catch(reject);
                    break;
                case 'png':
                case 'jpg':
                case 'jpeg':
                case 'gif':
                case 'webp':
                    this.loadImage(url).then(resolve).catch(reject);
                    break;
                default:
                    this.loadGenericResource(url).then(resolve).catch(reject);
            }
        });

        this.loadingPromises.set(url, promise);

        promise.then(() => {
            this.loadedResources.add(url);
            this.loadingPromises.delete(url);
        }).catch(() => {
            this.loadingPromises.delete(url);
        });

        return promise;
    }

    /**
     * 加载脚本文件
     * @param {string} url 脚本URL
     * @returns {Promise<void>}
     * @private
     */
    private loadScript(url): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
            document.head.appendChild(script);
        });
    }

    /**
     * 加载样式表
     * @param {string} url 样式表URL
     * @returns {Promise<void>}
     * @private
     */
    private loadStylesheet(url): Promise<void> {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load stylesheet: ${url}`));
            document.head.appendChild(link);
        });
    }

    /**
     * 预加载图片
     * @param {string} url 图片URL
     * @returns {Promise<void>}
     * @private
     */
    private loadImage(url): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }

    /**
     * 加载通用资源
     * @param {string} url 资源URL
     * @returns {Promise<void>}
     * @private
     */
    private loadGenericResource(url): Promise<void> {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            });
    }

    /**
     * 获取加载状态
     * @returns {Object} 加载状态信息
     */
    getStatus() {
        return {
            loadedCount: this.loadedResources.size,
            queueLength: this.queue.length,
            currentlyLoading: this.loadingCount,
            loadedResources: Array.from(this.loadedResources)
        };
    }

    /**
     * 清除已加载的资源记录
     */
    clear() {
        this.loadedResources.clear();
        this.loadingPromises.clear();
        this.queue = [];
        this.loadingCount = 0;
    }
}

// 创建资源预加载器实例
const resourcePreloader = new ResourcePreloader();

// 导出资源预加载器实例
export default resourcePreloader;