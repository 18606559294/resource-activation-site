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
        
        // 等待DOM加载完成
        // 确保在DOMContentLoaded之后初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // 增加初始化延迟，确保其他资源加载
                setTimeout(() => this.init(), 100);
            });
        } else {
            // 如果DOM已加载，延迟初始化
            setTimeout(() => this.init(), 100);
        }

        // 添加超时保护
        setTimeout(() => {
            if (document.documentElement.hasAttribute('data-i18n-loading')) {
                console.warn('国际化初始化超时，使用默认显示');
                this.handleInitTimeout();
            }
        }, 3000); // 3秒超时
    }

    /**
     * 初始化国际化管理器
     */
    async init() {
        try {
            // 获取初始语言
            const savedLang = localStorage.getItem('preferredLanguage');
            const systemLang = this.getSystemLanguage();
            const initialLang = savedLang || systemLang;
            
            // 预加载所有语言包
            await Promise.all([
                this.loadLanguage('zh'),
                this.loadLanguage('en')
            ]);

            // 设置初始语言
            await this.setLanguage(initialLang);
            
            // 初始化系统语言检测
            this.initSystemLanguageDetection();
            
            console.log('I18n initialized:', {
                current: this.currentLanguage,
                loaded: Array.from(this.loadedLanguages)
            });
        } catch (error) {
            console.error('Failed to initialize i18n:', error);
            // 使用默认语言作为后备方案
            this.fallbackToDefault();
        }
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
                if (newLang !== this.currentLanguage) {
                    this.setLanguage(newLang);
                }
            });
        }

        // 获取用户已保存的语言偏好
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang) {
            this.currentLanguage = savedLang;
        }
    }

    /**
     * 初始化语言包
     */
    async initializeTranslations() {
        try {
            // 同时加载当前语言和后备语言
            await Promise.all([
                this.loadLanguage(this.currentLanguage),
                this.loadLanguage(this.fallbackLanguage)
            ]);
            
            this.updatePageContent();
        } catch (error) {
            console.error('加载语言包失败:', error);
            // 如果加载失败,使用后备语言
            if (this.currentLanguage !== this.fallbackLanguage) {
                this.currentLanguage = this.fallbackLanguage;
                await this.loadLanguage(this.fallbackLanguage);
                this.updatePageContent();
            }
        }
    }

    /**
     * 动态加载语言包文件
     * @param {string} lang - 语言代码
     */
    async loadLanguage(lang) {
        if (this.loadedLanguages.has(lang)) {
            return;
        }

        try {
            // 添加超时控制
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

            const response = await fetch(`./locales/${lang}.json`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const translations = await response.json();
            this.translations[lang] = translations;
            this.loadedLanguages.add(lang);
        } catch (error) {
            console.error(`加载语言包失败 ${lang}:`, error);
            // 如果是当前语言加载失败，立即切换到后备语言
            if (lang === this.currentLanguage) {
                this.fallbackToDefault();
            }
            throw error;
        }
    }

    /**
     * 初始化超时处理
     */
    handleInitTimeout() {
        // 移除加载状态
        document.documentElement.removeAttribute('data-i18n-loading');
        
        // 使用内置的默认翻译
        this.translations[this.fallbackLanguage] = this.getDefaultTranslations();
        this.loadedLanguages.add(this.fallbackLanguage);
        
        // 更新页面内容
        this.currentLanguage = this.fallbackLanguage;
        this.updatePageContent();
    }

    /**
     * 切换到默认语言
     */
    fallbackToDefault() {
        this.currentLanguage = this.fallbackLanguage;
        document.documentElement.lang = this.fallbackLanguage;
        this.updatePageContent();
    }

    /**
     * 获取默认翻译
     */
    getDefaultTranslations() {
        // 内置基本的默认翻译
        return {
            nav: {
                home: "Home",
                tools: "Tools",
                resources: "Resources",
                security: "Security",
                status: "Status"
            },
            common: {
                loading: "Loading...",
                error: "Error",
                retry: "Retry"
            }
        };
    }

    /**
     * 设置当前语言
     * @param {string} lang - 语言代码
     */
    async setLanguage(lang) {
        if (lang === this.currentLanguage) {
            return;
        }

        try {
            // 确保语言包已加载
            if (!this.loadedLanguages.has(lang)) {
                await this.loadLanguage(lang);
            }

            if (!this.translations[lang]) {
                throw new Error(`Missing translations for ${lang}`);
            }

            // 更新当前语言
            const oldLang = this.currentLanguage;
            this.currentLanguage = lang;
            document.documentElement.lang = lang;

            // 保存用户偏好
            localStorage.setItem('preferredLanguage', lang);

            // 更新页面内容
            this.updatePageContent();
            this.notifyObservers();

            console.log('Language changed:', {
                from: oldLang,
                to: lang,
                translations: Object.keys(this.translations[lang]).length
            });
        } catch (error) {
            console.error('Language change failed:', error);

            // 恢复之前的语言
            if (lang !== this.fallbackLanguage) {
                console.log('Falling back to default language');
                await this.setLanguage(this.fallbackLanguage);
            }

            throw error; // 让调用者知道切换失败
        }
    }

    /**
     * 更新页面所有翻译内容
     */
    updatePageContent() {
        const elements = document.querySelectorAll('[data-i18n]');
        let translationsApplied = 0;

        elements.forEach(element => {
            try {
                const key = element.getAttribute('data-i18n');
                const attr = element.getAttribute('data-i18n-attr') || 'text';
                const translation = this.getTranslation(key);

                if (translation) {
                    translationsApplied++;
                    switch(attr) {
                        case 'text':
                            element.textContent = translation;
                            break;
                        case 'placeholder':
                            element.placeholder = translation;
                            break;
                        case 'title':
                            element.title = translation;
                            break;
                        case 'value':
                            element.value = translation;
                            break;
                        case 'html':
                            element.innerHTML = translation;
                            break;
                        default:
                            element.setAttribute(attr, translation);
                    }
                }
            } catch (error) {
                console.error('Translation error for element:', element, error);
                // 使用默认内容作为后备
                const defaultText = element.getAttribute('data-i18n-default');
                if (defaultText) {
                    element.textContent = defaultText;
                }
            }
        });

        console.log('Page content updated:', {
            elements: elements.length,
            translated: translationsApplied
        });

        // DOM变化监听
        if (!this.observer) {
            this.observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    // 仅当新增节点时才触发翻译
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        this.translatePage();
                    }
                });
            });
            this.observer.observe(document.body, {
                subtree: true,
                childList: true,
                attributes: false,
                characterData: false
            });
        }
    }

    /**
     * 翻译整个页面
     */
    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const attr = element.getAttribute('data-i18n-attr') || 'text';
            
            if (key) {
                const translation = this.getTranslation(key);
                if (translation) {
                    switch(attr) {
                        case 'text':
                            element.textContent = translation;
                            break;
                        case 'placeholder':
                            element.placeholder = translation;
                            break;
                        case 'title':
                            element.title = translation;
                            break;
                        case 'value':
                            element.value = translation;
                            break;
                        case 'html':
                            element.innerHTML = translation;
                            break;
                        default:
                            element.setAttribute(attr, translation);
                    }
                }
            }
        });
    }

    /**
     * 获取翻译文本
     * @param {string} path - 翻译键路径
     * @param {Object.<string, string>} [replacements={}] - 替换值
     * @returns {string}
     */
    getTranslation(path, replacements = {}) {
        const keys = path.split('.');
        let current = this.translations[this.currentLanguage];
        
        try {
            for (const key of keys) {
                if (!current || typeof current !== 'object') {
                    throw new Error(`无效的翻译路径: ${path}`);
                }
                current = current[key];
            }

            let translation = typeof current === 'string' ? current : JSON.stringify(current);
            translation = this.replacePlaceholders(translation, replacements);
            
            if (translation === path) {
                console.warn(`缺少翻译: ${path}`);
                return this.getFallbackTranslation(path, replacements);
            }
            
            return translation;
        } catch (error) {
            console.error(`翻译错误: ${error.message}`);
            return this.getFallbackTranslation(path, replacements);
        }
    }

    /**
     * 替换翻译文本中的占位符
     * @param {string} text - 翻译文本
     * @param {Object.<string, string>} replacements - 替换值
     * @returns {string}
     */
    replacePlaceholders(text, replacements) {
        return text.replace(/\{\{(\w+)\}\}/g, (_, key) => 
            replacements[key] !== undefined ? replacements[key] : `{{${key}}}`
        );
    }

    /**
     * 获取后备翻译
     * @param {string} path - 翻译键路径
     * @param {Object.<string, string>} [replacements={}] - 替换值
     * @returns {string}
     */
    getFallbackTranslation(path, replacements = {}) {
        const keys = path.split('.');
        let current = this.translations[this.fallbackLanguage];
        
        try {
            for (const key of keys) {
                if (!current || typeof current !== 'object') {
                    throw new Error(`无效的后备翻译路径: ${path}`);
                }
                current = current[key];
            }

            let translation = typeof current === 'string' ? current : JSON.stringify(current);
            translation = this.replacePlaceholders(translation, replacements);
            
            if (translation === path) {
                console.error(`缺少后备翻译: ${path}`);
                return path;
            }
            
            return translation;
        } catch (error) {
            console.error(`后备翻译错误: ${error.message}`);
            return path;
        }
    }

    /**
     * 添加语言变化观察者
     * @param {Observer} observer - 观察者对象或函数
     */
    addObserver(observer) {
        this.observers.add(observer);
    }

    /**
     * 移除观察者
     * @param {Observer} observer - 要移除的观察者
     */
    removeObserver(observer) {
        this.observers.delete(observer);
    }

    /**
     * 通知所有观察者语言变化
     */
    notifyObservers() {
        this.observers.forEach((observer) => {
            if (typeof observer === 'function') {
                observer(this.currentLanguage);
            } else if (observer && typeof observer.onLanguageChange === 'function') {
                observer.onLanguageChange(this.currentLanguage);
            }
        });
    }
}

// 创建单例实例
const i18nManager = new I18nManager();

// 导出实例
export default i18nManager;

// 添加到window对象以便在HTML中访问
window.i18nManager = i18nManager;
