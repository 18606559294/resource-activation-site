// i18n-manager.js - 国际化管理器

/**
 * 国际化管理类
 * 支持:
 * - 自动检测系统语言
 * - 动态加载语言包
 * - 无感切换语言
 * - 优雅降级
 */
export class I18nManager {
    constructor() {
        // 检查是否已经存在实例，避免重复初始化
        if (window.i18nManager instanceof I18nManager) {
            console.log('I18nManager已经初始化，返回现有实例');
            return window.i18nManager;
        }
        
        // 当前语言,默认使用系统语言
        this.currentLanguage = 'zh'; // 默认使用中文，确保初始加载时显示默认内容
        // 翻译内容缓存
        this.translations = {};
        // 语言变化观察者
        this.observers = new Set();
        // 后备语言(中文)
        this.fallbackLanguage = 'zh';
        // 已加载的语言包记录
        this.loadedLanguages = new Set();
        // 日期时间格式化器
        this.dateTimeFormatter = new Intl.DateTimeFormat();
        // 初始化状态
        this.isInitializing = false;
        this.initializationPromise = null;

        // 立即显示默认内容
        this.showDefaultContent();

        // 等待DOM加载完成后初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }

        // 增加超时保护时间
        setTimeout(() => {
            if (document.documentElement.hasAttribute('data-i18n-loading')) {
                console.warn('国际化初始化超时，使用默认显示');
                this.handleInitTimeout();
            }
        }, 5000); // 增加超时时间到5秒
        
        // 保存实例到全局
        window.i18nManager = this;
    }

    /**
     * 显示默认内容
     */
    showDefaultContent() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const defaultText = element.getAttribute('data-i18n-default');
            if (defaultText) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = defaultText;
                } else {
                    element.textContent = defaultText;
                }
                element.style.visibility = 'visible';
            }
        });
    }

    /**
     * 处理初始化超时
     */
    handleInitTimeout() {
        this.fallbackToDefault();
        // 移除加载状态
        document.documentElement.removeAttribute('data-i18n-loading');
        // 确保所有元素可见
        document.querySelectorAll('[data-i18n]').forEach(element => {
            element.style.visibility = 'visible';
        });
    }

    /**
     * 初始化国际化管理器
     */
    async init() {
        if (this.isInitializing) {
            return this.initializationPromise;
        }

        this.isInitializing = true;
        document.documentElement.setAttribute('data-i18n-loading', 'true');

        this.initializationPromise = (async () => {
            try {
                const savedLang = localStorage.getItem('preferredLanguage');
                const systemLang = this.getSystemLanguage();
                const initialLang = savedLang || systemLang;
                
                // 预加载所有语言包
                await Promise.all([
                    this.loadLanguage(initialLang).catch(error => {
                        console.warn(`${initialLang}语言包加载失败:`, error);
                        return null;
                    }),
                    this.loadLanguage(this.fallbackLanguage).catch(error => {
                        console.warn(`${this.fallbackLanguage}语言包加载失败:`, error);
                        return null;
                    })
                ]);

                if (this.loadedLanguages.size === 0) {
                    throw new Error('所有语言包加载失败');
                }

                // 设置初始语言
                const targetLang = this.loadedLanguages.has(initialLang) ? initialLang : this.fallbackLanguage;
                await this.setLanguage(targetLang);
                this.initSystemLanguageDetection();
                
                console.log('I18n initialized:', {
                    current: this.currentLanguage,
                    loaded: Array.from(this.loadedLanguages)
                });
            } catch (error) {
                console.error('Failed to initialize i18n:', error);
                this.fallbackToDefault();
            } finally {
                this.isInitializing = false;
                document.documentElement.removeAttribute('data-i18n-loading');
                // 确保所有元素可见
                document.querySelectorAll('[data-i18n]').forEach(element => {
                    element.style.visibility = 'visible';
                });
            }
        })();

        return this.initializationPromise;
    }

    /**
     * 获取系统/浏览器语言
     * @returns {string} 'zh' 或 'en'
     */
    getSystemLanguage() {
        const systemLang = navigator.language.toLowerCase();
        // 检查是否为中文语言代码
        if (systemLang.startsWith('zh')) {
            return 'zh';
        }
        return 'en'; // 默认英语
    }

    /**
     * 初始化系统语言检测
     */
    initSystemLanguageDetection() {
        // 监听系统语言变化
        if (window.languagechange !== undefined) {
            window.addEventListener('languagechange', () => {
                const newLang = this.getSystemLanguage();
                // 仅在用户未手动设置语言时自动切换
                if (!localStorage.getItem('preferredLanguage')) {
                    this.setLanguage(newLang);
                }
            });
        }
    }

    /**
     * 加载指定语言包
     * @param {string} lang 语言代码
     */
    async loadLanguage(lang) {
        if (this.loadedLanguages.has(lang)) {
            return;
        }

        const maxRetries = 3;
        const retryDelay = 1000; // 1秒延迟

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // 使用相对路径加载语言文件，避免在不同环境下的路径问题
                const response = await fetch(`./locales/${lang}.json`);
                if (!response.ok) {
                    console.warn(`尝试备用路径加载语言包: ${lang}`);
                    // 尝试备用路径
                    const backupResponse = await fetch(`../locales/${lang}.json`);
                    if (!backupResponse.ok) {
                        throw new Error(`HTTP error! status: ${response.status}, backup status: ${backupResponse.status}`);
                    }
                    const translations = await backupResponse.json();
                    this.translations[lang] = translations;
                    this.loadedLanguages.add(lang);
                    console.log(`成功从备用路径加载语言包: ${lang}`);
                    return;
                }
                const translations = await response.json();
                this.translations[lang] = translations;
                this.loadedLanguages.add(lang);
                console.log(`成功加载语言包: ${lang}`);
                return;
            } catch (error) {
                console.warn(`Failed to load language pack: ${lang} (Attempt ${attempt}/${maxRetries})`, error);
                if (attempt === maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }

    /**
     * 设置当前语言
     * @param {string} lang 语言代码
     */
    async setLanguage(lang) {
        try {
            if (!this.loadedLanguages.has(lang)) {
                await this.loadLanguage(lang);
            }

            this.currentLanguage = lang;
            localStorage.setItem('preferredLanguage', lang);
            document.documentElement.setAttribute('lang', lang);
            this.updateAllTranslations();
            this.notifyObservers();
        } catch (error) {
            console.error(`Failed to set language: ${lang}`, error);
            this.fallbackToDefault();
        }
    }

    /**
     * 更新所有翻译元素
     */
    updateAllTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const defaultText = element.getAttribute('data-i18n-default');
            const translation = this.translate(key, defaultText);
            element.textContent = translation;
        });

        // 更新占位符文本
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const defaultText = element.getAttribute('data-i18n-default-placeholder');
            const translation = this.translate(key, defaultText);
            element.setAttribute('placeholder', translation);
        });
    }

    /**
     * 翻译指定键值
     * @param {string} key 翻译键
     * @param {string} defaultText 默认文本
     * @returns {string} 翻译后的文本
     */
    translate(key, defaultText) {
        const translations = this.translations[this.currentLanguage];
        if (!translations) {
            return defaultText || key;
        }

        const keys = key.split('.');
        let result = translations;
        for (const k of keys) {
            if (result && typeof result === 'object') {
                result = result[k];
            } else {
                return defaultText || key;
            }
        }

        return result || defaultText || key;
    }

    /**
     * 添加语言变化观察者
     * @param {Function} observer 观察者函数
     */
    addObserver(observer) {
        this.observers.add(observer);
    }

    /**
     * 移除语言变化观察者
     * @param {Function} observer 观察者函数
     */
    removeObserver(observer) {
        this.observers.delete(observer);
    }

    /**
     * 通知所有观察者语言已变化
     */
    notifyObservers() {
        this.observers.forEach(observer => observer(this.currentLanguage));
    }

    /**
     * 处理初始化超时
     */
    handleInitTimeout() {
        this.fallbackToDefault();
        // 移除加载状态
        document.documentElement.removeAttribute('data-i18n-loading');
    }

    /**
     * 使用默认语言作为后备方案
     */
    fallbackToDefault() {
        this.currentLanguage = this.fallbackLanguage;
        document.documentElement.setAttribute('lang', this.fallbackLanguage);
        // 使用默认文本显示
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const defaultText = element.getAttribute('data-i18n-default');
            if (defaultText) {
                element.textContent = defaultText;
            }
        });
    }
}

// 创建单例实例
const i18nManager = new I18nManager();
export default i18nManager;
