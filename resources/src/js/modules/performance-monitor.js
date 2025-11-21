// 性能监控模块
class PerformanceMonitor {
    /** @type {Map<string, number>} */
    private metrics;
    /** @type {Map<string, number[]>} */
    private timeSeriesData;
    private readonly maxDataPoints = 100;

    constructor() {
        this.metrics = new Map();
        this.timeSeriesData = new Map();
        this.initObservers();
    }

    private initObservers() {
        // 观察页面加载性能
        if (window.PerformanceObserver) {
            // 观察页面绘制性能
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.recordMetric('fcp', entry.startTime);
                    }
                }
            });
            paintObserver.observe({ entryTypes: ['paint'] });

            // 观察资源加载性能
            const resourceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordResourceTiming(entry);
                }
            });
            resourceObserver.observe({ entryTypes: ['resource'] });

            // 观察长任务
            const longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordMetric('longTask', entry.duration);
                }
            });
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        }

        // 记录页面可交互时间
        window.addEventListener('DOMContentLoaded', () => {
            this.recordMetric('domContentLoaded', performance.now());
        });

        window.addEventListener('load', () => {
            this.recordMetric('loadComplete', performance.now());
            this.calculateNavigationTiming();
        });
    }

    private recordResourceTiming(entry) {
        const duration = entry.duration;
        const size = entry.transferSize;
        const type = entry.initiatorType;

        this.addTimeSeriesData(`resource_${type}_duration`, duration);
        if (size > 0) {
            this.addTimeSeriesData(`resource_${type}_size`, size);
        }
    }

    private calculateNavigationTiming() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.recordMetric('ttfb', navigation.responseStart - navigation.requestStart);
            this.recordMetric('domInteractive', navigation.domInteractive);
            this.recordMetric('domComplete', navigation.domComplete);
        }
    }

    /**
     * 记录性能指标
     * @param {string} name 指标名称
     * @param {number} value 指标值
     */
    public recordMetric(name, value) {
        this.metrics.set(name, value);
        this.addTimeSeriesData(name, value);
    }

    /**
     * 添加时间序列数据
     * @param {string} name 指标名称
     * @param {number} value 指标值
     */
    private addTimeSeriesData(name, value) {
        if (!this.timeSeriesData.has(name)) {
            this.timeSeriesData.set(name, []);
        }

        const data = this.timeSeriesData.get(name);
        data.push(value);

        // 保持数据点数量在限制范围内
        if (data.length > this.maxDataPoints) {
            data.shift();
        }
    }

    /**
     * 获取性能报告
     * @returns {Object} 性能报告对象
     */
    public getPerformanceReport() {
        const report = {
            metrics: Object.fromEntries(this.metrics),
            timeSeriesData: Object.fromEntries(this.timeSeriesData),
            summary: this.generateSummary()
        };

        return report;
    }

    /**
     * 生成性能总结
     * @returns {Object} 性能总结对象
     */
    private generateSummary() {
        const summary = {};

        // 计算各项指标的统计数据
        for (const [name, data] of this.timeSeriesData) {
            if (data.length > 0) {
                summary[name] = {
                    avg: this.calculateAverage(data),
                    min: Math.min(...data),
                    max: Math.max(...data),
                    p95: this.calculatePercentile(data, 95)
                };
            }
        }

        return summary;
    }

    /**
     * 计算数组平均值
     * @param {number[]} data 数据数组
     * @returns {number} 平均值
     */
    private calculateAverage(data) {
        return data.reduce((a, b) => a + b, 0) / data.length;
    }

    /**
     * 计算百分位数
     * @param {number[]} data 数据数组
     * @param {number} percentile 百分位数（0-100）
     * @returns {number} 百分位数值
     */
    private calculatePercentile(data, percentile) {
        const sorted = [...data].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[index];
    }
}

// 创建性能监控实例
const performanceMonitor = new PerformanceMonitor();

// 导出性能监控实例
export default performanceMonitor;