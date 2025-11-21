declare module '*.js' {
  export interface LanguageSwitcher {
    init(): void;
    updateButtonStates(lang: string): void;
  }

  export const languageSwitcher: LanguageSwitcher;
}
