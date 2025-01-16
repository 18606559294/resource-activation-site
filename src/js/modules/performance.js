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
      // 记录日志
      this.logToFile(metric);
      
      // 检查性能阈值
      if (this.isCriticalMetric(metric)) {
        this.triggerAlert(metric);
      }

      // 发送到分析服务
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          type: metric.entryType,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          pageUrl: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send metric:', error);
      this.logError(error);
    }
  }

  // 记录日志到文件
  logToFile(metric) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...metric,
      context: {
        userAgent: navigator.userAgent,
        pageUrl: window.location.href,
        connection: navigator.connection ? navigator.connection.effectiveType : 'unknown'
      }
    };

    // 发送日志到服务器
    fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logEntry)
    }).catch(error => console.error('Logging failed:', error));
  }

  // 检查关键性能指标
  isCriticalMetric(metric) {
    const thresholds = {
      FCP: 2000,  // 2 seconds
      LCP: 2500,  // 2.5 seconds
      CLS: 0.25,  // Cumulative Layout Shift
      TTFB: 600,  // 600ms
      FID: 100    // 100ms
    };

    return thresholds[metric.name] && metric.value > thresholds[metric.name];
  }

  // 触发性能报警
  triggerAlert(metric) {
    const alertData = {
      type: 'performance',
      metric: metric.name,
      value: metric.value,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href
    };

    fetch('/api/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(alertData)
    }).catch(error => console.error('Alert failed:', error));
  }

  // 记录错误
  logError(error) {
    const errorData = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context: {
        userAgent: navigator.userAgent,
        pageUrl: window.location.href
      }
    };

    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorData)
    }).catch(err => console.error('Error logging failed:', err));
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
