// 语言切换器组件
import i18nManager from '../modules/i18n-manager.js';
import { uiFeedback } from '../modules/ui-feedback.js';

class LanguageSwitcher {
    constructor() {
        this.container = document.querySelector('.language-switcher');
        this.buttons = new Map();
        this.init();
    }

    init() {
        // 初始化语言切换按钮
        this.container.querySelectorAll('button[data-lang]').forEach(button => {
            const lang = button.getAttribute('data-lang');
            this.buttons.set(lang, button);
            button.addEventListener('click', () => this.switchLanguage(lang));
        });

        // 设置初始状态
        this.updateButtonStates(i18nManager.currentLanguage);

        // 监听系统语言变化
        i18nManager.addObserver(this.updateButtonStates.bind(this));

        // 添加键盘导航支持
        this.setupKeyboardNavigation();

        // 添加系统语言变化监听
        if (window.languagechange !== undefined) {
            window.addEventListener('languagechange', () => {
                const systemLang = i18nManager.getSystemLanguage();
                if (!localStorage.getItem('preferredLanguage')) {
                    // 只在用户没有设置偏好语言时跟随系统
                    this.switchLanguage(systemLang, true);
                }
            });
        }
    }

    /**
     * 切换语言
     * @param {string} lang - 目标语言
     * @param {boolean} [isSystemChange=false] - 是否是系统触发的变化
     */
    async switchLanguage(lang, isSystemChange = false) {
        try {
            // 显示切换状态
            const button = this.buttons.get(lang);
            const loadingClass = 'is-loading';
            button.classList.add(loadingClass);
            button.disabled = true;

            // 切换语言
            await i18nManager.setLanguage(lang);

            // 更新按钮状态
            this.updateButtonStates(lang);

            // 如果不是系统触发的变化，保存用户偏好
            if (!isSystemChange) {
                localStorage.setItem('preferredLanguage', lang);
            }

            // 显示成功提示
            uiFeedback.showToast(i18nManager.getTranslation('messages.languageChanged'), 'success');
        } catch (error) {
            console.error('语言切换失败:', error);
            uiFeedback.showToast(i18nManager.getTranslation('messages.languageChangeFailed'), 'error');
        } finally {
            // 恢复按钮状态
            const button = this.buttons.get(lang);
            button.classList.remove('is-loading');
            button.disabled = false;
        }
    }

    /**
     * 更新所有语言按钮状态
     * @param {string} currentLang - 当前语言
     */
    updateButtonStates(currentLang) {
        this.buttons.forEach((button, lang) => {
            const isActive = lang === currentLang;
            button.setAttribute('aria-pressed', isActive.toString());
            button.classList.toggle('active', isActive);
            
            // 更新无障碍标签
            const labelKey = isActive ? 'currentLanguage' : 'switchTo';
            const ariaLabel = i18nManager.getTranslation(['accessibility', labelKey], {
                language: i18nManager.getTranslation(['languages', lang])
            });
            button.setAttribute('aria-label', ariaLabel);

            // 更新按钮文本
            const buttonText = i18nManager.getTranslation(['languages', lang]);
            button.textContent = buttonText;
        });
    }

    /**
     * 设置键盘导航
     */
    setupKeyboardNavigation() {
        const buttons = Array.from(this.buttons.values());
        let currentIndex = -1;

        this.container.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    event.preventDefault();
                    currentIndex = (currentIndex + 1) % buttons.length;
                    buttons[currentIndex].focus();
                    break;

                case 'ArrowLeft':
                case 'ArrowUp':
                    event.preventDefault();
                    currentIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                    buttons[currentIndex].focus();
                    break;

                case 'Home':
                    event.preventDefault();
                    currentIndex = 0;
                    buttons[currentIndex].focus();
                    break;

                case 'End':
                    event.preventDefault();
                    currentIndex = buttons.length - 1;
                    buttons[currentIndex].focus();
                    break;
            }
        });
    }
}

// 创建并导出语言切换器实例
export const languageSwitcher = new LanguageSwitcher();
export default languageSwitcher;
