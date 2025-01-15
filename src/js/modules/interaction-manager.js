import { uiFeedback } from './ui-feedback.js';

// 用户交互管理模块
class InteractionManager {
  constructor() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // 触摸事件处理
    document.addEventListener('touchstart', this.handleTouchStart.bind(this));
    document.addEventListener('touchmove', this.handleTouchMove.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));

    // 键盘快捷键
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // 错误处理
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));

    // 网络状态
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));

    // 页面可见性
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  // 处理触摸开始
  handleTouchStart(event) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  // 处理触摸移动
  handleTouchMove(event) {
    if (!this.touchStartX || !this.touchStartY) {
      return;
    }

    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;

    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;

    // 检测滑动手势
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (Math.abs(deltaX) > 50) {
        event.preventDefault();
        this.handleSwipe(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      // 垂直滑动
      if (Math.abs(deltaY) > 50) {
        event.preventDefault();
        this.handleSwipe(deltaY > 0 ? 'down' : 'up');
      }
    }
  }

  // 处理触摸结束
  handleTouchEnd() {
    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  // 处理滑动手势
  handleSwipe(direction) {
    // 触发自定义事件
    const event = new CustomEvent('swipe', {
      detail: { direction }
    });
    document.dispatchEvent(event);
  }

  // 处理键盘快捷键
  handleKeyDown(event) {
    // Ctrl + / 显示快捷键帮助
    if (event.ctrlKey && event.key === '/') {
      event.preventDefault();
      this.showShortcutsHelp();
    }

    // Esc 关闭当前对话框或弹窗
    if (event.key === 'Escape') {
      this.handleEscapeKey();
    }
  }

  // 显示快捷键帮助
  async showShortcutsHelp() {
    const helpContent = `
      <div class="shortcuts-help">
        <h4>键盘快捷键</h4>
        <ul>
          <li><kbd>Ctrl</kbd> + <kbd>/</kbd> - 显示此帮助</li>
          <li><kbd>Esc</kbd> - 关闭弹窗</li>
          <li><kbd>Ctrl</kbd> + <kbd>B</kbd> - 返回首页</li>
          <li><kbd>Ctrl</kbd> + <kbd>F</kbd> - 搜索</li>
        </ul>
      </div>
    `;

    await uiFeedback.showConfirm({
      title: '快捷键帮助',
      message: helpContent,
      confirmText: '了解',
      showCancel: false
    });
  }

  // 处理 Escape 键
  handleEscapeKey() {
    const activeElement = document.querySelector('.dialog-overlay, .loading-overlay');
    if (activeElement) {
      activeElement.remove();
    }
  }

  // 处理错误
  handleError(error) {
    console.error('Application error:', error);
    uiFeedback.showToast(
      '发生错误，请稍后重试',
      'error'
    );
  }

  // 处理 Promise 错误
  handlePromiseError(event) {
    console.error('Unhandled promise rejection:', event.reason);
    uiFeedback.showToast(
      '操作失败，请检查网络连接',
      'error'
    );
  }

  // 处理网络状态变化
  handleNetworkChange(isOnline) {
    if (isOnline) {
      uiFeedback.showToast('网络已连接', 'success');
    } else {
      uiFeedback.showToast('网络连接已断开', 'warning');
    }
  }

  // 处理页面可见性变化
  handleVisibilityChange() {
    if (document.hidden) {
      // 页面隐藏时的处理
      document.title = '记得回来看看哦 👋';
    } else {
      // 页面显示时的处理
      document.title = document.querySelector('title').dataset.originalTitle;
    }
  }

  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 节流函数
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

export const interactionManager = new InteractionManager();
export default interactionManager;
