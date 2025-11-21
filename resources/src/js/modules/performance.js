const API_ENDPOINTS = {
  development: {
    metrics: '/api/metrics',
    logs: '/api/logs',
    errors: '/api/errors'
  },
  production: {
    metrics: 'https://api.your-domain.com/metrics',
    logs: 'https://api.your-domain.com/logs',
    errors: 'https://api.your-domain.com/errors'
  }
};

// 性能监控模块
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.pendingMetrics = [];
    this.isProcessingQueue = false;
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

  // 压缩数据
  async compressData(data) {
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const compressed = await new Promise((resolve) => {
      const compressed = [];
      const ds = new DeflateStream({
        ondata(chunk) {
          compressed.push(chunk);
        },
        onend() {
          resolve(Buffer.concat(compressed));
        }
      });
      ds.write(encoder.encode(jsonString));
      ds.end();
    });
    return compressed;
  }

  // 存储到本地
  storeLocally(metric) {
    try {
      const storedMetrics = JSON.parse(localStorage.getItem('pendingMetrics') || '[]');
      storedMetrics.push({
        ...metric,
        timestamp: Date.now()
      });
      localStorage.setItem('pendingMetrics', JSON.stringify(storedMetrics));
    } catch (error) {
      console.error('Failed to store metric locally:', error);
    }
  }

  // 发送队列中的指标
  async processQueue() {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    try {
      while (this.pendingMetrics.length > 0) {
        const batch = this.pendingMetrics.splice(0, 10); // 每次处理10条
        await this.sendBatch(batch);
      }

      // 处理本地存储的指标
      const storedMetrics = JSON.parse(localStorage.getItem('pendingMetrics') || '[]');
      if (storedMetrics.length > 0) {
        await this.sendBatch(storedMetrics);
        localStorage.removeItem('pendingMetrics');
      }
    } catch (error) {
      console.error('Failed to process metric queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // 批量发送指标
  async sendBatch(metrics) {
    const env = process.env.NODE_ENV || 'development';
    const endpoints = API_ENDPOINTS[env];

    try {
      const compressedData = await this.compressData(metrics);
      const response = await fetch(endpoints.metrics, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Encoding': 'deflate'
        },
        body: compressedData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      // 存储失败的指标
      metrics.forEach(metric => this.storeLocally(metric));
      throw error;
    }
  }

  async sendToAnalytics(metric, retries = 3) {
    try {
      // 记录日志
      this.logToFile(metric);
      
      // 检查性能阈值
      if (this.isCriticalMetric(metric)) {
        this.triggerAlert(metric);
      }

      // 添加到待处理队列
      this.pendingMetrics.push(metric);
      
      // 启动队列处理
      await this.processQueue();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.sendToAnalytics(metric, retries - 1);
      }
      console.error('Failed to send metric:', error);
      this.storeLocally(metric);
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
