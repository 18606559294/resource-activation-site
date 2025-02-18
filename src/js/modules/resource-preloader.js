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
     * 预加载资源
     * @param {Array} resources 资源列表
     * @param {Object} options 预加载选项
     * @returns {Promise<void>}
     */
    async preload(resources, options = {}) {
        const {
            priority = 'high',
            timeout = 10000,
            retries = 3,
            onProgress = null
        } = options;

        let loaded = 0;
        const total = resources.length;

        try {
            const loadPromises = resources.map(async (resource) => {
                try {
                    const module = await import(resource.path);
                    this.loadedResources.add(resource.path);
                    loaded++;
                    if (onProgress) {
                        onProgress(loaded, total);
                    }
                    return module;
                } catch (error) {
                    console.error(`Failed to load resource: ${resource.path}`, error);
                    throw error;
                }
            });

            await Promise.all(loadPromises);
        } catch (error) {
            console.error('Resource preloading failed:', error);
            throw error;
        }
    }
}