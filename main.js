// 导入样式文件
import './src/css/styles.css';
import './src/css/ui-feedback.css';
import './src/css/animations.css';
import './src/css/mobile.css';
import './src/css/themes.css';
import './src/css/components.css';
import './src/css/deepseek-chat.css';

// 导入核心模块
import { ResourcePreloader } from './src/js/modules/resource-preloader.js';
import { showErrorMessage, showLoadingIndicator, hideLoadingIndicator } from './src/js/components/ui-feedback.js';

// 初始化资源预加载器
const resourcePreloader = new ResourcePreloader();

// 定义关键资源列表
const criticalResources = [
    { path: './src/js/app.js', type: 'module' },
    { path: './src/js/animations.js', type: 'module' },
    { path: './src/js/theme-manager.js', type: 'module' },
    { path: './src/js/components.js', type: 'module' },
    { path: './src/js/tools-manager.js', type: 'module' },
    { path: './src/i18n.js', type: 'module' }
];

// 初始化应用
async function initializeApp() {
    try {
        // 显示加载状态
        showLoadingIndicator('正在初始化应用...');

        // 预加载关键资源
        await resourcePreloader.preload(criticalResources, {
            priority: 'high',
            timeout: 15000,
            retries: 3,
            onProgress: (loaded, total) => {
                showLoadingIndicator(`正在加载应用资源...(${Math.round(loaded/total*100)}%)`);
            }
        });

        // 确保页面基础结构可见
        document.body.style.visibility = 'visible';
        
        // 动态导入并初始化应用
        const { default: app } = await import('./src/js/app.js');
        if (!app.initialized) {
            await app.init();
        }

        // 移除加载状态
        document.documentElement.removeAttribute('data-i18n-loading');
        hideLoadingIndicator();

        console.log('应用初始化完成');
    } catch (error) {
        console.error('应用初始化失败:', error);

        // 确保页面至少显示基础内容
        document.body.style.visibility = 'visible';
        document.documentElement.removeAttribute('data-i18n-loading');

        // 显示用户友好的错误信息
        showErrorMessage({
            title: '应用加载失败',
            message: '很抱歉，应用加载过程中发生错误。请检查网络连接并刷新页面重试。',
            actionText: '重新加载',
            actionHandler: () => location.reload()
        });
    }
}

// 确保DOM加载完成后再初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
