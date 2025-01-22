 declare module './i18n-manager.js' {
  export interface TranslationOptions {
    fallback?: string;
  }

  export interface Observer {
    onLanguageChange?: (language: string) => void;
  }

  export class I18nManager {
    currentLanguage: string;
    translations: Record<string, Record<string, any>>;
    observers: Set<Observer | ((language: string) => void)>;
    fallbackLanguage: string;
    loadedLanguages: Set<string>;
    errorMessages: Map<string, string>;
    dateTimeFormatter: Intl.DateTimeFormat;

    constructor();
    init(): Promise<void>;
    addObserver(observer: Observer | ((language: string) => void)): void;
    removeObserver(observer: Observer | ((language: string) => void)): void;
    updatePageContent(): void;
    getTranslation(path: string, replacements?: Record<string, string>): string;
    getFallbackTranslation(path: string, replacements?: Record<string, string>): string;
    notifyObservers(): void;
  }

  const i18nManager: I18nManager;
  export default i18nManager;
}
