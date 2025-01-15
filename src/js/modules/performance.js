// 性能监控模块
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.initObservers();
  }

  initObservers() {
    // 性能观察器
    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.logMetric(entry);
      }
    });

    // 观察各种性能指标
    this.performanceObserver.observe({
      entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint', 'layout-shift']
    });

    // 监控长任务
    this.longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // 超过50ms的任务被视为长任务
          console.warn('Long Task detected:', entry);
        }
      }
    });

    this.longTaskObserver.observe({ entryTypes: ['longtask'] });
  }

  logMetric(entry) {
    this.metrics[entry.name] = {
      value: entry.startTime || entry.duration || entry.value,
      type: entry.entryType
    };

    // 如果是关键性能指标，发送到分析服务
    if (this.isKeyMetric(entry)) {
      this.sendToAnalytics(entry);
    }
  }

  isKeyMetric(entry) {
    const keyMetrics = [
      'FCP',
      'LCP',
      'CLS',
      'TTFB',
      'FID'
    ];
    return keyMetrics.includes(entry.name);
  }

  async sendToAnalytics(metric) {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          type: metric.entryType,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to send metric:', error);
    }
  }

  // 获取核心性能指标
  getCoreMetrics() {
    return {
      FCP: this.metrics.FCP?.value,
      LCP: this.metrics.LCP?.value,
      CLS: this.metrics.CLS?.value,
      TTFB: this.metrics.TTFB?.value,
      FID: this.metrics.FID?.value
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
