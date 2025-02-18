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
        // 当前语言,默认使用系统语言
        this.currentLanguage = 'en'; // 默认英语，等待初始化完成后再设置
        // 翻译内容缓存
        this.translations = {};
        // 语言变化观察者
        this.observers = new Set();
        // 后备语言(英语)
        this.fallbackLanguage = 'en';
        // 已加载的语言包记录
        this.loadedLanguages = new Set();
        // 日期时间格式化器
        this.dateTimeFormatter = new Intl.DateTimeFormat();
        // 初始化状态
        this.isInitializing = false;
        this.initializationPromise = null;

        // 等待DOM加载完成后立即初始化
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
                // 确保移除加载状态
                document.documentElement.removeAttribute('data-i18n-loading');
            }
        }, 5000); // 增加到5秒超时
    }

    /**
     * 初始化国际化管理器
     */
    async init() {
        if (this.isInitializing) {
            return this.initializationPromise;
        }

        this.isInitializing = true;
        this.initializationPromise = (async () => {
            try {
                document.documentElement.setAttribute('data-i18n-loading', 'true');
                const savedLang = localStorage.getItem('preferredLanguage');
                const systemLang = this.getSystemLanguage();
                const initialLang = savedLang || systemLang;
                
                // 预加载所有语言包，添加重试机制
                const loadWithRetry = async (lang, retries = 3) => {
                    for (let i = 0; i < retries; i++) {
                        try {
                            await Promise.race([
                                this.loadLanguage(lang),
                                new Promise((_, reject) => 
                                    setTimeout(() => reject(new Error(`加载${lang}语言包超时`)), 5000)
                                )
                            ]);
                            return;
                        } catch (error) {
                            if (i === retries - 1) throw error;
                            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                        }
                    }
                };

                await Promise.all([
                    loadWithRetry('zh').catch(error => {
                        console.warn('中文语言包加载失败:', error);
                        return null;
                    }),
                    loadWithRetry('en').catch(error => {
                        console.warn('英文语言包加载失败:', error);
                        return null;
                    })
                ]);

                if (this.loadedLanguages.size === 0) {
                    throw new Error('所有语言包加载失败');
                }

                await this.setLanguage(initialLang);
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

        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const translations = await response.json();
            this.translations[lang] = translations;
            this.loadedLanguages.add(lang);
        } catch (error) {
            console.error(`Failed to load language pack: ${lang}`, error);
            throw error;
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
