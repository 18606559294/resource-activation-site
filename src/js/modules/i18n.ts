// 国际化模块
declare global {
    interface Window {
        trackError?: (error: { type: string; language: string; error: string }) => void;
    }
}

class I18nManager {
    currentLanguage: string;
    translations: Record<string, any>;
    callbacks: Set<(lang: string) => void>;

    constructor() {
        const storedLang: string | null = localStorage.getItem('language');
        this.currentLanguage = storedLang !== null ? storedLang : 'zh';
        this.translations = {};
        this.callbacks = new Set();
    }

    isInitializing: boolean = false;

    async init() {
        if (this.isInitializing) return;
        this.isInitializing = true;
        
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
            // 记录错误日志
            if (typeof window.trackError === 'function') {
                window.trackError({
                    type: 'i18n_load_failed',
                    language: this.currentLanguage,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            // 回退到默认语言
            if (this.currentLanguage !== 'zh') {
                this.setLanguage('zh');
            }
        } finally {
            this.isInitializing = false;
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
    translate(key: string, params: Record<string, string> = {}) {
        if (!key || typeof key !== 'string') {
            console.warn('Invalid translation key:', key);
            return key;
        }

    let text: string = key;
        try {
            const result = key.split('.').reduce((obj, k) => {
                if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                    const value = obj[k];
                    if (typeof value === 'string') {
                        return value;
                    }
                    if (value && typeof value === 'object') {
                        return value;
                    }
                }
                return key;
            }, this.translations);
            text = typeof result === 'string' ? result : key;
        } catch (error) {
            console.warn(`Translation failed for key "${key}":`, error);
            return key;
        }

        // 处理插值并转义HTML
        return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
            const safeValue = typeof paramValue === 'string' 
                ? paramValue
                    .replace(/&/g, '&')
                    .replace(/</g, '<')
                    .replace(/>/g, '>')
                    .replace(/"/g, '"')
                    .replace(/'/g, '&#039;')
                : paramValue;
            return result.replace(new RegExp(`{${paramKey}}`, 'g'), safeValue);
        }, text);
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
