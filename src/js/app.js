// 导入核心模块
import { i18nManager } from './modules/i18n-manager.js';
import { uiFeedback } from './modules/ui-feedback.js';
import { interactionManager } from './modules/interaction-manager.js';
import { languageSwitcher } from './components/language-switcher.js';
import './animation.js'; // 启用动画效果

// 应用初始化类
class App {
  initialized: boolean;

  constructor() {
    this.initialized = false;
    this.init();
  }

  async init(retryCount: number = 3): Promise<void> {
    try {
      // 防止重复初始化
      if (this.initialized) {
        return;
      }

      // 显示加载状态和进度
      this.showLoadingState('正在初始化应用...');

      // 初始化国际化
      await this.retryOperation(
        () => i18nManager.init(),
        '初始化语言失败',
        retryCount
      );

      // 初始化页面交互
      this.initializePageInteractions();

      // 设置主题
      await this.setupTheme();

      // 初始化完成
      this.initialized = true;
      this.hideLoadingState();

      // 显示欢迎消息
      this.showWelcomeMessage();

    } catch (error: any) { // any fix
      console.error('Failed to initialize application:', error);
      this.handleInitError(error, retryCount);
    }
  }

  initializePageInteractions(): void {
    // 初始化卡片点击事件
    document.querySelectorAll('.card').forEach((card: Element) => {
      card.addEventListener('click', (event: Event) => this.handleCardClick(event));

      // 添加键盘支持
      card.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.handleCardClick(event);
        }
      });
    });

    // 监听网络状态变化
    window.addEventListener('online', () => {
      uiFeedback.showToast(i18nManager.getTranslation(['common', 'online']), 'success');
    });

    window.addEventListener('offline', () => {
      uiFeedback.showToast(i18nManager.getTranslation(['common', 'offline']), 'warning');
    });

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.initialized) {
        // 检查更新
        this.checkForUpdates();
      }
    });
  }

  // 显示加载状态
  showLoadingState(message: string): void {
    document.body.classList.add('loading');
    uiFeedback.showLoading(message);
  }

  // 隐藏加载状态
  hideLoadingState(): void {
    document.body.classList.remove('loading');
    uiFeedback.hideLoading();
  }

  // 处理初始化错误
  async handleInitError(error: Error, retryCount: number): Promise<void> {
    if (retryCount > 0) {
      uiFeedback.showToast('初始化失败，正在重试...', 'warning');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.init(retryCount - 1);
    } else {
      uiFeedback.showToast('应用初始化失败，请刷新页面重试', 'error');
    }
  }

  // 重试操作
  async retryOperation<T>(operation: () => Promise<T>, errorMessage: string, retryCount: number = 3): Promise<T> {
    for (let i = 0; i < retryCount; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retryCount - 1) throw error;
        console.warn(`${errorMessage}，重试中...`, error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Retry failed');
  }

  async setupTheme(): Promise<void> {
    // 从本地存储获取主题设置
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // 设置初始主题
    if (savedTheme) {
      this.updateTheme(savedTheme === 'dark');
    } else {
      this.updateTheme(prefersDark.matches);
    }

    // 监听系统主题变化
    prefersDark.addEventListener('change', (event: MediaQueryListEvent) => {
      if (!savedTheme) {
        this.updateTheme(event.matches);
      }
    });
  }

  updateTheme(isDark: boolean): void {
    document.documentElement.classList.toggle('dark-theme', isDark);
    // 更新主题色
    const themeColor = isDark ? '#1a1a1a' : '#ffffff';
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', themeColor);
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  async handleCardClick(event: Event): Promise<void> {
    const card  = event.currentTarget as HTMLElement;
    const action = card.dataset.action;


    try {
      switch (action) {
        case 'toolbox':
          await this.navigateToPage('/toolbox.html');
          break;
        case 'feedback':
          await this.navigateToPage('/feedback.html');
          break;
        case 'security':
          await this.navigateToPage('/security.html');
          break;
        case 'resources':
          await this.navigateToPage('/resources.html');
          break;
      }
    } catch (error) {
      console.error('Navigation failed:', error);
      uiFeedback.showToast(i18nManager.getTranslation(['errors', 'navigationError']), 'error');
    }
  }

  async navigateToPage(url: string, retryCount: number = 3): Promise<void> {
    try {
      // 显示加载状态
      this.showLoadingState(i18nManager.getTranslation(['common', 'navigating']));

      // 预加载页面
      await this.retryOperation(async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Navigation failed');
      }, '页面加载失败', retryCount);

      // 跳转到目标页面
      window.location.href = url;
    } catch (error) {
      console.error('Navigation failed:', error);
      uiFeedback.showToast(i18nManager.getTranslation(['errors', 'navigationError']), 'error');
    } finally {
      this.hideLoadingState();
    }
  }

  async checkForUpdates(): Promise<void> {
    try {
      // 检查服务工作线程更新
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  showWelcomeMessage(): void {
    const hour = new Date().getHours();
    let greeting: string;

    if (hour < 6) {
      greeting = 'greetings.night';
    } else if (hour < 12) {
      greeting = 'greetings.morning';
    } else if (hour < 18) {
      greeting = 'greetings.afternoon';
    } else {
      greeting = 'greetings.evening';
    }

    uiFeedback.showToast(i18nManager.getTranslation(['common', greeting]), 'info');
  }
}

// 创建应用实例
const app = new App();

// 导出应用实例供其他模块使用
export default app;
