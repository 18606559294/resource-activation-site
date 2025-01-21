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
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) { // 检查 key 是否为 null
              const translation = this.getTranslation(key);
              if (translation) {
                  if (element instanceof HTMLInputElement && element.type === 'text') {
                      element.placeholder = translation;
                  } else if(element) { // 检查 element 是否存在
                      element.textContent = translation;
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

        for (const key of keys) {
          if (typeof current !== 'object' || current === null || current === undefined) { // 检查 current 是否为对象且不为 null
            return this.getFallbackTranslation(path, replacements);
          }
          current = current[key];
        }

        if (typeof current !== 'string') { // 检查 current 是否为字符串
          return this.getFallbackTranslation(path, replacements);
        }

        return this.replacePlaceholders(current, replacements);
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

        for (const key of keys) {
          if (typeof current !== 'object' || current === null || current === undefined) { // 检查 current 是否为对象且不为 null
            return path;
          }
          current = current[key];
        }


        return typeof current === 'string' ? this.replacePlaceholders(current, replacements) : path; // 检查 current 是否为字符串
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
    // ... (其他方法不变)
}


export default new I18nManager();
