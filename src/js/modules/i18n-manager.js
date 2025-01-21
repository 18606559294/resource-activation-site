// i18n-manager.js
export class I18nManager {
    constructor() {
        this.currentLanguage = 'zh';
        this.translations = {};
        this.observers = new Set();
        this.fallbackLanguage = 'en';
        this.loadedLanguages = new Set();
        this.errorMessages = new Map();
        this.dateTimeFormatter = new Intl.DateTimeFormat();
    }

    async init() {
        try {
            await this.loadTranslations(this.currentLanguage);
            this.updatePageContent();
        } catch (error) {
            console.error('Failed to initialize i18n manager:', error);
        }
    }

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

    updatePageContent() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        this.notifyObservers();
    }

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

    replacePlaceholders(text, replacements) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return replacements[key] !== undefined ? replacements[key] : match;
        });
    }

    addObserver(observer) {
        this.observers.add(observer);
    }

    removeObserver(observer) {
        this.observers.delete(observer);
    }

    notifyObservers() {
        this.observers.forEach(observer => {
            if (typeof observer === 'function') {
                observer(this.currentLanguage);
            } else if (observer && typeof observer.onLanguageChange === 'function') {
                observer.onLanguageChange(this.currentLanguage);
            }
        });
    }

    formatDate(date, options = {}) {
        return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
    }

    formatNumber(number, options = {}) {
        return new Intl.NumberFormat(this.currentLanguage, options).format(number);
    }

    formatCurrency(amount, currency = 'CNY') {
        return new Intl.NumberFormat(this.currentLanguage, {
            style: 'currency',
            currency
        }).format(amount);
    }

    formatRelativeTime(value, unit) {
        const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, {
            numeric: 'auto'
        });
        return rtf.format(value, unit);
    }

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
