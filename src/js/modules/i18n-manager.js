// i18n-manager.js

/**
 * @typedef {Object} TranslationOptions
 * @property {string} [fallback] - Fallback text if translation is not found
 */

/**
 * @typedef {Object|Function} Observer
 * @property {(language: string) => void} [onLanguageChange] - Callback function for language changes
 */


/**
 * Manages internationalization for the application
 */
export class I18nManager {
    constructor() {
        /** @type {string} */
        this.currentLanguage = 'zh';
        /** @type {Object.<string, Object>} */
        this.translations = {};
        /** @type {Set<Observer>} */
        this.observers = new Set();
        /** @type {string} */
        this.fallbackLanguage = 'en';
        /** @type {Set<string>} */
        this.loadedLanguages = new Set();
        /** @type {Map<string, string>} */
        this.errorMessages = new Map();
        /** @type {Intl.DateTimeFormat} */
        this.dateTimeFormatter = new Intl.DateTimeFormat();
    }

    // ... (其他方法不变)

    /**
     * Updates all page content with translations
     */
    updatePageContent() {
        // 添加MutationObserver监听DOM变化
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
                        default:
                            element.setAttribute(attr, translation);
                    }
                }
            }
        });
        this.notifyObservers();
    }


    /**
     * Gets a translation by key path
     * @param {string} path - Translation key path
     * @param {Object.<string, string>} [replacements={}] - Replacement values
     * @returns {string}
     */
    getTranslation(path, replacements = {}) {
        const keys = path.split('.');
        let current = this.translations[this.currentLanguage];
        
        try {
            for (const key of keys) {
                if (!current || typeof current !== 'object') {
                    throw new Error(`Invalid translation path: ${path}`);
                }
                current = current[key];
            }

            let translation = typeof current === 'string' ? current : JSON.stringify(current);
            translation = this.replacePlaceholders(translation, replacements);
            
            // 记录缺失的翻译键
            if (translation === path) {
                console.warn(`Missing translation: ${path}`);
                this.trackMissingKey(path);
            }
            
            return translation;
        } catch (error) {
            console.error(`Translation error: ${error.message}`);
            return this.getFallbackTranslation(path, replacements);
        }
    }


    /**
     * Gets a fallback translation
     * @param {string} path - Translation key path
     * @param {Object.<string, string>} [replacements={}] - Replacement values
     * @returns {string}
     */
    getFallbackTranslation(path, replacements = {}) {
        const keys = path.split('.');
        let current = this.translations[this.fallbackLanguage];
        
        try {
            for (const key of keys) {
                if (!current || typeof current !== 'object') {
                    throw new Error(`Invalid fallback path: ${path}`);
                }
                current = current[key];
            }

            let translation = typeof current === 'string' ? current : JSON.stringify(current);
            translation = this.replacePlaceholders(translation, replacements);
            
            // 记录备用语言缺失键
            if (translation === path) {
                console.error(`Missing fallback translation: ${path}`);
                this.trackMissingKey(path, true);
            }
            
            return translation;
        } catch (error) {
            console.error(`Fallback translation error: ${error.message}`);
            return path;
        }
    }

    /**
     * Notifies all observers of language changes
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

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
        this.updatePageContent();
        localStorage.setItem('preferredLanguage', this.currentLanguage);
    }
    // ... (其他方法不变)
}


export default new I18nManager();
