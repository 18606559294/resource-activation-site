/**
 * 应用主模块
 */

// 导入必要的模块
import { I18nManager } from './modules/i18n-manager.js';
import { DeepSeekIntegration } from './modules/deepseek-integration.js';
import initGlobalChat from './global-chat-init.js';

class App {
    constructor() {
        this.initialized = false;
    }

    /**
     * 初始化应用
     */
    async init() {
        if (this.initialized) {
            return;
        }

        try {
            // 初始化国际化
            if (!window.i18nManager) {
                window.i18nManager = new I18nManager();
            }

            // 初始化主题
            await this.initTheme();

            // 初始化其他功能模块
            await this.initModules();

            this.initialized = true;
            console.log('应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化主题
     */
    async initTheme() {
        const { default: ThemeManager } = await import('./theme-manager.js');
        const themeManager = new ThemeManager();
        await themeManager.init();
    }

    /**
     * 初始化其他功能模块
     */
    async initModules() {
        // 根据需要初始化其他模块
        const modules = [
            import('./components.js'),
            import('./tools-manager.js')
        ];

        await Promise.all(modules);
        
        // 初始化DeepSeek API集成
        try {
            new DeepSeekIntegration();
            console.log('DeepSeek API集成初始化完成');
        } catch (error) {
            console.error('DeepSeek API集成初始化失败:', error);
        }
    }
}

// 导出应用实例
export default new App();