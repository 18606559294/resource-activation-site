import { uiFeedback } from './ui-feedback.js';

class I18nManager {
  constructor() {
    this.translations = new Map();
    this.currentLocale = this.getInitialLocale();
    this.defaultLocale = 'zh';
    this.supportedLocales = ['zh', 'en'];
    this.observers = new Set();
  }

  // 获取初始语言设置
  getInitialLocale() {
    // 按优先级获取语言设置
    return (
      localStorage.getItem('userLanguage') ||                    // 1. 用户设置
      navigator.language.split('-')[0] ||                        // 2. 浏览器语言
      this.defaultLocale                                        // 3. 默认语言
    );
  }

  // 初始化
  async init() {
    try {
      // 加载默认语言
      await this.loadTranslations(this.defaultLocale);
      
      // 如果当前语言不是默认语言，加载当前语言
      if (this.currentLocale !== this.defaultLocale) {
        await this.loadTranslations(this.currentLocale);
      }

      // 初始化完成后更新页面
      this.updatePageContent();
      
      // 设置 HTML lang 属性
      document.documentElement.lang = this.currentLocale;
      
      // 设置文字方向
      const direction = this.getTranslation(['meta', 'direction']) || 'ltr';
      document.documentElement.dir = direction;

    } catch (error) {
      console.error('Failed to initialize i18n:', error);
      uiFeedback.showToast('Failed to load language resources', 'error');
    }
  }

  // 加载翻译文件
  async loadTranslations(locale) {
    try {
      const response = await fetch(`/locales/${locale}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${locale}`);
      }
      const translations = await response.json();
      this.translations.set(locale, translations);
    } catch (error) {
      console.error(`Error loading translations for ${locale}:`, error);
      throw error;
    }
  }

  // 切换语言
  async setLocale(locale) {
    if (!this.supportedLocales.includes(locale)) {
      console.error(`Unsupported locale: ${locale}`);
      return;
    }

    try {
      // 如果还没有加载该语言的翻译，先加载
      if (!this.translations.has(locale)) {
        await this.loadTranslations(locale);
      }

      this.currentLocale = locale;
      localStorage.setItem('userLanguage', locale);
      
      // 更新 HTML lang 属性
      document.documentElement.lang = locale;
      
      // 更新文字方向
      const direction = this.getTranslation(['meta', 'direction']) || 'ltr';
      document.documentElement.dir = direction;

      // 更新页面内容
      this.updatePageContent();
      
      // 通知观察者
      this.notifyObservers();

      // 显示成功提示
      uiFeedback.showToast('Language changed successfully', 'success');
    } catch (error) {
      console.error('Failed to change language:', error);
      uiFeedback.showToast('Failed to change language', 'error');
    }
  }

  // 获取翻译
  getTranslation(path, replacements = {}) {
    // 获取当前语言的翻译
    const translations = this.translations.get(this.currentLocale);
    if (!translations) {
      return this.getFallbackTranslation(path, replacements);
    }

    // 通过路径获取翻译
    let result = path.reduce((obj, key) => obj?.[key], translations);
    
    // 如果没有找到翻译，使用后备翻译
    if (result === undefined) {
      return this.getFallbackTranslation(path, replacements);
    }

    // 替换占位符
    if (typeof result === 'string') {
      result = this.replacePlaceholders(result, replacements);
    }

    return result;
  }

  // 获取后备翻译
  getFallbackTranslation(path, replacements) {
    // 尝试从默认语言获取翻译
    const defaultTranslations = this.translations.get(this.defaultLocale);
    if (!defaultTranslations) {
      return path[path.length - 1];
    }

    let result = path.reduce((obj, key) => obj?.[key], defaultTranslations);
    if (result === undefined) {
      return path[path.length - 1];
    }

    if (typeof result === 'string') {
      result = this.replacePlaceholders(result, replacements);
    }

    return result;
  }

  // 替换占位符
  replacePlaceholders(text, replacements) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return replacements[key] !== undefined ? replacements[key] : match;
    });
  }

  // 更新页面内容
  updatePageContent() {
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const path = element.getAttribute('data-i18n').split('.');
      const translation = this.getTranslation(path);
      
      if (translation) {
        // 检查是否有 HTML 内容
        if (element.hasAttribute('data-i18n-html')) {
          element.innerHTML = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    // 更新所有带有 data-i18n-placeholder 属性的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const path = element.getAttribute('data-i18n-placeholder').split('.');
      const translation = this.getTranslation(path);
      if (translation) {
        element.placeholder = translation;
      }
    });

    // 更新所有带有 data-i18n-aria-label 属性的元素
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
      const path = element.getAttribute('data-i18n-aria-label').split('.');
      const translation = this.getTranslation(path);
      if (translation) {
        element.setAttribute('aria-label', translation);
      }
    });
  }

  // 添加观察者
  addObserver(observer) {
    this.observers.add(observer);
  }

  // 移除观察者
  removeObserver(observer) {
    this.observers.delete(observer);
  }

  // 通知观察者
  notifyObservers() {
    this.observers.forEach(observer => {
      if (typeof observer === 'function') {
        observer(this.currentLocale);
      } else if (observer.onLanguageChange) {
        observer.onLanguageChange(this.currentLocale);
      }
    });
  }

  // 格式化日期
  formatDate(date, options = {}) {
    return new Intl.DateTimeFormat(this.currentLocale, options).format(date);
  }

  // 格式化数字
  formatNumber(number, options = {}) {
    return new Intl.NumberFormat(this.currentLocale, options).format(number);
  }

  // 格式化货币
  formatCurrency(amount, currency = 'CNY') {
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // 格式化相对时间
  formatRelativeTime(value, unit) {
    const rtf = new Intl.RelativeTimeFormat(this.currentLocale, {
      numeric: 'auto'
    });
    return rtf.format(value, unit);
  }
}

export const i18nManager = new I18nManager();
export default i18nManager;
