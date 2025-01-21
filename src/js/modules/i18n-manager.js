// i18n-manager.js

/**
 * @typedef {Object} TranslationOptions
 * @property {string} [fallback] - Fallback text if translation is not found
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
        /** @type {Set<Function|Object>} */
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

    /**
     * Initializes the I18nManager
     * @returns {Promise<void>}
     */
    async init() {
        try {
            await this.loadTranslations(this.currentLanguage);
            this.updatePageContent();
        } catch (error) {
            console.error('Failed to initialize i18n manager:', error);
        }
    }

    /**
     * Loads translations for a specific language
     * @param {string} language - Language code
     * @returns {Promise<void>}
     */
    async loadTranslations(language) {
        try {
            const response = await fetch(`/locales/${language}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.translations[language] = await response.json();
            this.loadedLanguages.add(language);
        } catch (error) {
            console.error(`Failed to load translations for ${language}:`, error);
            throw error;
        }
    }

    /**
     * Updates all page content with translations
     */
    updatePageContent() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation) {
                if (element instanceof HTMLInputElement && element.type === 'text') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
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
            if (current === undefined) {
                return this.getFallbackTranslation(path, replacements);
            }
            current = current[key];
        }

        if (current === undefined) {
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
            if (current === undefined) {
                return path;
            }
            current = current[key];
        }

        return current ? this.replacePlaceholders(current, replacements) : path;
    }

    /**
     * Replaces placeholders in text with values
     * @param {string} text - Text with placeholders
     * @param {Object.<string, string>} replacements - Replacement values
     * @returns {string}
     */
    replacePlaceholders(text, replacements) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return replacements[key] !== undefined ? replacements[key] : match;
        });
    }

    /**
     * Adds an observer
     * @param {Function|Object} observer - Observer to add
     */
    addObserver(observer) {
        this.observers.add(observer);
    }

    /**
     * Removes an observer
     * @param {Function|Object} observer - Observer to remove
     */
    removeObserver(observer) {
        this.observers.delete(observer);
    }

    /**
     * Notifies all observers of language changes
     */
    notifyObservers() {
        this.observers.forEach(observer => {
            if (typeof observer === 'function') {
                observer(this.currentLanguage);
            } else if (observer && typeof observer.onLanguageChange === 'function') {
                observer.onLanguageChange(this.currentLanguage);
            }
        });
    }

    /**
     * Formats a date according to current locale
     * @param {Date} date - Date to format
     * @param {Intl.DateTimeFormatOptions} [options={}] - Format options
     * @returns {string}
     */
    formatDate(date, options = {}) {
        return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
    }

    /**
     * Formats a number according to current locale
     * @param {number} number - Number to format
     * @param {Intl.NumberFormatOptions} [options={}] - Format options
     * @returns {string}
     */
    formatNumber(number, options = {}) {
        return new Intl.NumberFormat(this.currentLanguage, options).format(number);
    }

    /**
     * Formats currency according to current locale
     * @param {number} amount - Amount to format
     * @param {string} [currency='CNY'] - Currency code
     * @returns {string}
     */
    formatCurrency(amount, currency = 'CNY') {
        return new Intl.NumberFormat(this.currentLanguage, {
            style: 'currency',
            currency
        }).format(amount);
    }

    /**
     * Formats relative time according to current locale
     * @param {number} value - Time value
     * @param {Intl.RelativeTimeFormatUnit} unit - Time unit
     * @returns {string}
     */
    formatRelativeTime(value, unit) {
        const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, {
            numeric: 'auto'
        });
        return rtf.format(value, unit);
    }

    /**
     * Gets an error message
     * @param {string} key - Error key
     * @param {TranslationOptions} [params={}] - Parameters
     * @returns {string}
     */
    getErrorMessage(key, params = {}) {
        const message = this.errorMessages.get(key);
        if (!message) {
            if (params.fallback) {
                return params.fallback;
            }
            return key;
        }
        return this.replacePlaceholders(message, params);
    }
}

export default new I18nManager();
