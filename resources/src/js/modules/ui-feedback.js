// UI 反馈模块
class UIFeedback {
  constructor() {
    this.toastContainer = this.createToastContainer();
    this.loadingOverlay = this.createLoadingOverlay();
    document.body.appendChild(this.toastContainer);
    document.body.appendChild(this.loadingOverlay);
  }

  // 创建 Toast 容器
  createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    return container;
  }

  // 创建加载遮罩
  createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>
    `;
    overlay.style.display = 'none';
    return overlay;
  }

  // 显示 Toast 消息
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${this.getToastIcon(type)}</div>
      <div class="toast-message">${message}</div>
    `;

    this.toastContainer.appendChild(toast);

    // 动画效果
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // 自动关闭
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        this.toastContainer.removeChild(toast);
      }, 300);
    }, duration);
  }

  // 获取 Toast 图标
  getToastIcon(type) {
    const icons = {
      success: '<svg>...</svg>', // 成功图标
      error: '<svg>...</svg>',   // 错误图标
      warning: '<svg>...</svg>', // 警告图标
      info: '<svg>...</svg>'     // 信息图标
    };
    return icons[type] || icons.info;
  }

  // 显示加载状态
  showLoading(message = '加载中...') {
    this.loadingOverlay.querySelector('.loading-text').textContent = message;
    this.loadingOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  // 隐藏加载状态
  hideLoading() {
    this.loadingOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  // 显示确认对话框
  async showConfirm(options) {
    return new Promise((resolve) => {
      const dialog = document.createElement('div');
      dialog.className = 'dialog-overlay';
      dialog.innerHTML = `
        <div class="dialog">
          <h3 class="dialog-title">${options.title || '确认'}</h3>
          <div class="dialog-content">${options.message}</div>
          <div class="dialog-buttons">
            <button class="btn btn-secondary" data-action="cancel">
              ${options.cancelText || '取消'}
            </button>
            <button class="btn btn-primary" data-action="confirm">
              ${options.confirmText || '确认'}
            </button>
          </div>
        </div>
      `;

      const handleClick = (e) => {
        const action = e.target.dataset.action;
        if (action) {
          dialog.remove();
          resolve(action === 'confirm');
        }
      };

      dialog.addEventListener('click', handleClick);
      document.body.appendChild(dialog);
    });
  }

  // 显示进度条
  showProgress(options = {}) {
    const progress = document.createElement('div');
    progress.className = 'progress-bar';
    progress.innerHTML = `
      <div class="progress-track">
        <div class="progress-fill"></div>
      </div>
      <div class="progress-text">0%</div>
    `;

    const fill = progress.querySelector('.progress-fill');
    const text = progress.querySelector('.progress-text');

    let currentProgress = 0;
    const targetProgress = options.progress || 0;
    const duration = options.duration || 300;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      currentProgress = targetProgress * progress;
      fill.style.width = `${currentProgress}%`;
      text.textContent = `${Math.round(currentProgress)}%`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    return progress;
  }
}

export const uiFeedback = new UIFeedback();
export default uiFeedback;
