// 广告初始化模块

class AdInitializer {
    constructor() {
        this.adContainers = {
            'top-ad': { format: 'auto' },
            'sidebar-ad': { format: 'vertical' },
            'bottom-ad': { format: 'horizontal' }
        };
    }

    init() {
        // 确保广告管理器已加载
        if (!window.adManager) {
            console.error('Ad manager not found');
            return;
        }

        // 初始化所有广告容器
        Object.entries(this.adContainers).forEach(([containerId, config]) => {
            const container = document.getElementById(containerId);
            if (container) {
                window.adManager.createAd('google', container, config);
            }
        });

        // 监听动态加载的广告容器
        this.observeNewAdContainers();
    }

    observeNewAdContainers() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        node.classList.contains('ad-container')) {
                        const containerId = node.id;
                        if (this.adContainers[containerId]) {
                            window.adManager.createAd(
                                'google',
                                node,
                                this.adContainers[containerId]
                            );
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// 在DOM加载完成后初始化广告
document.addEventListener('DOMContentLoaded', () => {
    const adInitializer = new AdInitializer();
    adInitializer.init();
});