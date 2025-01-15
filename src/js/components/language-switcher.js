import { i18nManager } from '../modules/i18n-manager.js';
import { uiFeedback } from '../modules/ui-feedback.js';

class LanguageSwitcher {
  constructor() {
    this.container = document.querySelector('.language-switcher');
    this.buttons = new Map();
    this.init();
  }

  init() {
    // 初始化语言切换按钮
    this.container.querySelectorAll('button[data-lang]').forEach(button => {
      const lang = button.getAttribute('data-lang');
      this.buttons.set(lang, button);
      button.addEventListener('click', () => this.switchLanguage(lang));
    });

    // 更新当前语言按钮状态
    this.updateButtonStates(i18nManager.currentLocale);

    // 监听语言变化
    i18nManager.addObserver(this.updateButtonStates.bind(this));

    // 添加键盘导航支持
    this.setupKeyboardNavigation();
  }

  async switchLanguage(lang) {
    try {
      // 显示加载状态
      const button = this.buttons.get(lang);
      const originalText = button.textContent;
      button.textContent = '...';
      button.disabled = true;

      // 切换语言
      await i18nManager.setLocale(lang);

      // 更新按钮状态
      this.updateButtonStates(lang);
    } catch (error) {
      console.error('Failed to switch language:', error);
      uiFeedback.showToast('Failed to switch language', 'error');
    } finally {
      // 恢复按钮状态
      const button = this.buttons.get(lang);
      button.textContent = i18nManager.getTranslation(['nav', lang]);
      button.disabled = false;
    }
  }

  updateButtonStates(currentLang) {
    this.buttons.forEach((button, lang) => {
      const isActive = lang === currentLang;
      button.setAttribute('aria-pressed', isActive.toString());
      button.classList.toggle('active', isActive);
      
      // 更新无障碍标签
      const labelKey = isActive ? 'currentLanguage' : 'switchTo';
      const ariaLabel = i18nManager.getTranslation(['accessibility', labelKey], {
        language: i18nManager.getTranslation(['languages', lang])
      });
      button.setAttribute('aria-label', ariaLabel);
    });
  }

  setupKeyboardNavigation() {
    let buttons = Array.from(this.buttons.values());
    let currentIndex = -1;

    this.container.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          currentIndex = (currentIndex + 1) % buttons.length;
          buttons[currentIndex].focus();
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          currentIndex = (currentIndex - 1 + buttons.length) % buttons.length;
          buttons[currentIndex].focus();
          break;

        case 'Home':
          event.preventDefault();
          currentIndex = 0;
          buttons[currentIndex].focus();
          break;

        case 'End':
          event.preventDefault();
          currentIndex = buttons.length - 1;
          buttons[currentIndex].focus();
          break;
      }
    });
  }
}

// 创建并导出语言切换器实例
export const languageSwitcher = new LanguageSwitcher();
export default languageSwitcher;
