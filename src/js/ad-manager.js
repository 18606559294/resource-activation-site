// 广告管理器
class AdManager {
    constructor() {
        this.platforms = {
            google: false,
            baidu: false,
            alimama: false,
            jd: false,
            pdd: false
        };
        this.stats = {
            impressions: {},
            clicks: {},
            revenue: {}
        };
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1秒
        this.init();
    }

    init() {
        // 加载必要的SDK
        this.loadSDKs();
        // 初始化统计
        this.initTracking();
        // 加载保存的统计数据
        this.loadStats();
        // 添加错误监听
        this.setupErrorHandling();
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            if (event.message.includes('adsbygoogle')) {
                console.error('AdSense error:', event);
                this.handleAdError('google', event);
            }
        });
    }

    async loadSDKs() {
        try {
            // Google AdSense
            await this.loadScript({
                src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4468142418161903',
                async: true,
                crossOrigin: 'anonymous'
            });
            this.platforms.google = true;
        } catch (error) {
            console.error('Failed to load Google AdSense:', error);
            this.handleAdError('google', error);
        }
    }

    loadScript(config) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.async = config.async;
            script.src = config.src;
            if (config.crossOrigin) {
                script.crossOrigin = config.crossOrigin;
            }

            script.onload = () => resolve();
            script.onerror = (error) => reject(error);

            document.head.appendChild(script);
        });
    }

    initTracking() {
        // 初始化统计数据
        const platforms = ['google', 'baidu', 'alimama', 'jd', 'pdd'];
        platforms.forEach(platform => {
            this.stats.impressions[platform] = 0;
            this.stats.clicks[platform] = 0;
            this.stats.revenue[platform] = 0;
        });
    }

    handleAdError(platform, error) {
        // 记录错误
        console.error(`${platform} ad error:`, error);
        
        // 发送错误报告
        this.sendTrackingData({
            type: 'error',
            platform,
            error: error.message,
            timestamp: new Date().getTime()
        });

        // 如果是配置错误，禁用该平台
        if (error.message.includes('configuration')) {
            this.platforms[platform] = false;
        }
    }

    trackImpression(platform, position) {
        if (!this.platforms[platform]) return;

        this.stats.impressions[platform]++;
        this.saveStats();
        
        // 发送统计请求到服务器
        this.sendTrackingData({
            type: 'impression',
            platform,
            position,
            timestamp: new Date().getTime()
        });
    }

    trackClick(platform, position) {
        if (!this.platforms[platform]) return;

        this.stats.clicks[platform]++;
        this.saveStats();

        // 发送统计请求到服务器
        this.sendTrackingData({
            type: 'click',
            platform,
            position,
            timestamp: new Date().getTime()
        });
    }

    async sendTrackingData(data) {
        try {
            const response = await fetch('/api/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    url: window.location.href,
                    userAgent: navigator.userAgent
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to send tracking data:', error);
            // 保存到本地，稍后重试
            this.queueFailedTrackingData(data);
        }
    }

    queueFailedTrackingData(data) {
        const queue = JSON.parse(localStorage.getItem('adTrackingQueue') || '[]');
        queue.push(data);
        localStorage.setItem('adTrackingQueue', JSON.stringify(queue));
    }

    retryFailedTracking() {
        const queue = JSON.parse(localStorage.getItem('adTrackingQueue') || '[]');
        if (queue.length === 0) return;

        // 重试发送失败的统计数据
        const retryData = queue.shift();
        this.sendTrackingData(retryData)
            .then(() => {
                localStorage.setItem('adTrackingQueue', JSON.stringify(queue));
            })
            .catch(() => {
                // 如果还是失败，把数据放回队列
                queue.push(retryData);
                localStorage.setItem('adTrackingQueue', JSON.stringify(queue));
            });
    }

    saveStats() {
        localStorage.setItem('adStats', JSON.stringify(this.stats));
    }

    loadStats() {
        const savedStats = localStorage.getItem('adStats');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        }
    }

    // Google AdSense
    async createGoogleAd(container, format = 'auto') {
        if (!this.platforms.google) {
            console.warn('Google AdSense is not available');
            return;
        }

        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.dataset.adClient = 'ca-pub-4468142418161903';
        ins.dataset.adFormat = format;
        ins.dataset.fullWidthResponsive = 'true';
        
        container.appendChild(ins);
        
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
            this.trackImpression('google', container.id);
        } catch (error) {
            this.handleAdError('google', error);
            this.tryAlternativeAd(container);
        }
    }

    tryAlternativeAd(container) {
        // 如果Google广告失败，尝试其他平台的广告
        if (this.platforms.baidu) {
            this.createBaiduAd(container);
        }
    }

    createAd(platform, container, options = {}) {
        // 检查平台是否可用
        if (!this.platforms[platform]) {
            console.warn(`${platform} ads are not available`);
            return;
        }

        switch (platform) {
            case 'google':
                this.createGoogleAd(container, options.format);
                break;
            default:
                console.error('Unknown platform:', platform);
        }
    }

    // 性能监控
    measureAdPerformance(platform, containerId) {
        const startTime = performance.now();
        
        // 创建性能观察者
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.name.includes('adsbygoogle')) {
                    const loadTime = entry.duration;
                    this.sendTrackingData({
                        type: 'performance',
                        platform,
                        containerId,
                        loadTime,
                        timestamp: new Date().getTime()
                    });
                }
            });
        });

        // 观察资源加载时间
        observer.observe({ entryTypes: ['resource'] });

        return () => {
            observer.disconnect();
            const totalTime = performance.now() - startTime;
            return totalTime;
        };
    }
}

// 导出广告管理器实例
window.adManager = new AdManager();
