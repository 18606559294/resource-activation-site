// 导入核心模块
import { i18nManager } from './modules/i18n-manager.js';
import { uiFeedback } from './modules/ui-feedback.js';
import { interactionManager } from './modules/interaction-manager.js';
import { languageSwitcher } from './components/language-switcher.js';

// 应用初始化类
class App {
  constructor() {
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      // 防止重复初始化
      if (this.initialized) {
        return;
      }

      // 显示加载状态
      document.body.classList.add('loading');

      // 初始化国际化
      await i18nManager.init();

      // 初始化页面交互
      this.initializePageInteractions();

      // 设置主题
      this.setupTheme();

      // 初始化完成
      this.initialized = true;
      document.body.classList.remove('loading');

      // 显示欢迎消息
      this.showWelcomeMessage();

    } catch (error) {
      console.error('Failed to initialize application:', error);
      uiFeedback.showToast('应用初始化失败，请刷新页面重试', 'error');
    }
  }

  initializePageInteractions() {
    // 初始化卡片点击事件
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', (event) => this.handleCardClick(event));
      
      // 添加键盘支持
      card.addEventListener('keydown', (event) => {
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

  setupTheme() {
    // 检测系统主题
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 初始设置
    this.updateTheme(prefersDark.matches);
    
    // 监听系统主题变化
    prefersDark.addEventListener('change', (event) => {
      this.updateTheme(event.matches);
    });
  }

  updateTheme(isDark) {
    document.documentElement.classList.toggle('dark-theme', isDark);
    // 更新主题色
    const themeColor = isDark ? '#1a1a1a' : '#ffffff';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
  }

  async handleCardClick(event) {
    const card = event.currentTarget;
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

  async navigateToPage(url) {
    try {
      // 显示加载状态
      uiFeedback.showLoading(i18nManager.getTranslation(['common', 'loading']));
      
      // 模拟页面加载延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 跳转到目标页面
      window.location.href = url;
    } finally {
      uiFeedback.hideLoading();
    }
  }

  async checkForUpdates() {
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

  showWelcomeMessage() {
    const hour = new Date().getHours();
    let greeting;

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
