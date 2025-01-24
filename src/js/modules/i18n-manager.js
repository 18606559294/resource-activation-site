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
        this.currentLanguage = this.getSystemLanguage();
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

        // 初始化系统语言检测
        this.initSystemLanguageDetection();
        // 加载初始语言包
        this.initializeTranslations();
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
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const translations = await response.json();
            this.translations[lang] = translations;
            this.loadedLanguages.add(lang);
        } catch (error) {
            console.error(`加载语言包失败 ${lang}:`, error);
            throw error;
        }
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
            // 按需加载语言包
            if (!this.loadedLanguages.has(lang)) {
                await this.loadLanguage(lang);
            }

            this.currentLanguage = lang;
            localStorage.setItem('preferredLanguage', lang);
            document.documentElement.lang = lang;
            this.updatePageContent();
            this.notifyObservers();
        } catch (error) {
            console.error(`切换语言失败 ${lang}:`, error);
            // 切换失败时回退到备用语言
            if (lang !== this.fallbackLanguage) {
                await this.setLanguage(this.fallbackLanguage);
            }
        }
    }

    /**
     * 更新页面所有翻译内容
     */
    updatePageContent() {
        // DOM变化监听
        if (!this.observer) {
            this.observer = new MutationObserver(mutations => {
                mutations.forEach(() => this.translatePage());
            });
            this.observer.observe(document.body, {
                subtree: true,
                childList: true,
                attributes: false,
                characterData: false
            });
        }
        this.translatePage();
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

// 创建并导出单例实例
export default new I18nManager();
