// 国际化模块
class I18nManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        this.translations = {};
    }

    async init() {
        try {
            const response = await fetch(`/locales/${this.currentLanguage}.json`);
            this.translations = await response.json();
            this.updatePageContent();
        } catch (error) {
            console.error('Failed to load translations:', error);
        }
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        this.init();
    }

    translate(key) {
        return key.split('.').reduce((obj, k) => obj?.[k], this.translations) || key;
    }

    updatePageContent() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.translate(key);
        });
    }
}

export const i18n = new I18nManager();
export default i18n;
