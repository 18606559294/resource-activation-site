// 国际化模块
class I18nManager {
    /** @type {string} */
    currentLanguage;
    /** @type {Record<string, any>} */
    translations;
    /** @type {Set<(lang: string) => void>} */
    callbacks;

    constructor() {
        /** @type {string | null} */
        const storedLang = localStorage.getItem('language');
        this.currentLanguage = storedLang !== null ? storedLang : 'zh';
        this.translations = {};
        this.callbacks = new Set();
    }

    async init() {
        try {
            const response = await fetch(`/locales/${this.currentLanguage}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            this.updatePageContent();
            this.notifyCallbacks();
        } catch (error) {
            console.error('Failed to load translations:', error);
            // 回退到默认语言
            if (this.currentLanguage !== 'zh') {
                this.setLanguage('zh');
            }
        }
    }

    /**
     * 设置当前语言
     * @param {string} lang - 语言代码 (如 'zh', 'en')
     */
    setLanguage(lang) {
        if (this.currentLanguage === lang) return;
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        this.init();
    }

    /**
     * 翻译文本
     * @param {string} key - 翻译键
     * @param {Record<string, string>} [params] - 插值参数
     * @returns {string}
     */
    translate(key, params = {}) {
        /** @type {string} */
        let text = key;
        try {
            text = /** @type {string} */ (key.split('.').reduce(
                (/** @type {Record<string, any> | string} */ obj, /** @type {string} */ k) => {
                    if (typeof obj === 'object' && obj !== null) {
                        const value = obj[k];
                        return typeof value === 'string' ? value : key;
                    }
                    return key;
                },
                /** @type {Record<string, any> | string} */ (this.translations)
            ));
        } catch {
            // 如果解析失败，返回原始key
            return key;
        }
        
        // 处理插值
        Object.entries(params).forEach(([key, value]) => {
            text = text.replace(new RegExp(`{${key}}`, 'g'), value);
        });

        return text;
    }

    updatePageContent() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n') || '';
            const params = JSON.parse(element.getAttribute('data-i18n-params') || '{}');
            
            // 更新文本内容
            element.textContent = this.translate(key, params);
            
            // 更新HTML属性
            ['title', 'placeholder', 'aria-label'].forEach(attr => {
                const attrKey = element.getAttribute(`data-i18n-${attr}`);
                if (attrKey) {
                    element.setAttribute(attr, this.translate(attrKey, params));
                }
            });
        });
    }

    /**
     * 注册语言切换回调
     * @param {(lang: string) => void} callback
     * @returns {() => void} 取消监听函数
     */
    onLanguageChange(callback) {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback);
    }

    notifyCallbacks() {
        this.callbacks.forEach(callback => callback(this.currentLanguage));
    }
}

export const i18n = new I18nManager();
export default i18n;
