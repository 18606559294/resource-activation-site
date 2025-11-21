/**
 * 资源预加载器
 */
export class ResourcePreloader {
    constructor() {
        this.loadedResources = new Set();
        this.loadingPromises = new Map();
        this.maxConcurrent = 5;
        this.loadingCount = 0;
        this.queue = [];
    }

    /**
     * 添加资源到加载队列
     * @param {Object} resource 资源对象
     * @param {Object} options 加载选项
     * @private
     * @returns {Promise} 加载资源的Promise
     */
    _addToQueue(resource, options) {
        this.queue.push({ resource, options });
        return new Promise((resolve, reject) => {
            // 创建一个Promise来跟踪资源加载
            const originalProcess = this._processQueue.bind(this);
            this._processQueue = async () => {
                await originalProcess();
                // 当资源加载完成时，检查是否是当前资源
                if (this.loadedResources.has(resource.url)) {
                    resolve();
                }
            };
            this._processQueue().catch(reject);
        });
    }

    /**
     * 处理加载队列
     * @private
     */
    async _processQueue() {
        if (this.loadingCount >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        const { resource, options } = this.queue.shift();
        this.loadingCount++;

        try {
            await this._loadResource(resource, options);
        } finally {
            this.loadingCount--;
            this._processQueue();
        }
    }

    /**
     * 加载单个资源
     * @param {Object} resource 资源对象
     * @param {Object} options 加载选项
     * @private
     */
    async _loadResource(resource, options) {
        const { timeout = 10000, retries = 3 } = options;

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(resource.url, {
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                this.loadedResources.add(resource.url);
                return objectUrl;

            } catch (error) {
                if (attempt === retries - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            }
        }
    }

    /**
     * 预加载资源
     * @param {Array} resources 资源列表
     * @param {Object} options 预加载选项
     * @returns {Promise<void>}
     */
    async preload(resources, options = {}) {
        const {
            onProgress = null
        } = options;

        let loaded = 0;
        const total = resources.length;

        try {
            const loadPromises = resources.map(resource => {
                return new Promise((resolve, reject) => {
                    if (this.loadedResources.has(resource.url)) {
                        loaded++;
                        if (onProgress) onProgress(loaded, total);
                        resolve();
                        return;
                    }

                    if (this.loadingPromises.has(resource.url)) {
                        this.loadingPromises.get(resource.url)
                            .then(() => {
                                loaded++;
                                if (onProgress) onProgress(loaded, total);
                                resolve();
                            })
                            .catch(reject);
                        return;
                    }

                    const promise = this._addToQueue(resource, options)
                        .then(() => {
                            loaded++;
                            if (onProgress) onProgress(loaded, total);
                        });

                    this.loadingPromises.set(resource.url, promise);
                    promise
                        .then(resolve)
                        .catch(reject)
                        .finally(() => {
                            this.loadingPromises.delete(resource.url);
                        });
                });
            });

            await Promise.all(loadPromises);
        } catch (error) {
            console.error('Resource preloading failed:', error);
            throw error;
        }
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.loadedResources.clear();
        this.loadingPromises.clear();
        this.queue = [];
    }
}