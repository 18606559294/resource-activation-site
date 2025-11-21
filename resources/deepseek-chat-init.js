/**
 * DeepSeek 客服聊天窗口初始化脚本
 * 用于在网站加载时初始化客服聊天窗口
 */

import DeepSeekChatWidget from './src/js/modules/deepseek-chat-widget.js';
import i18n from './src/i18n.js';

// 在DOM加载完成后初始化客服聊天窗口
document.addEventListener('DOMContentLoaded', () => {
    // 延迟加载客服窗口，避免影响页面首次加载性能
    setTimeout(() => {
        try {
            // 初始化客服聊天窗口
            window.deepseekChatWidget = new DeepSeekChatWidget();
            console.log(i18n.t('deepseek.logs.initialized', 'DeepSeek客服聊天窗口已加载'));
        } catch (error) {
            console.error(i18n.t('deepseek.logs.initFailed', '初始化DeepSeek客服聊天窗口失败:'), error);
        }
    }, 1000); // 延迟1秒加载
});