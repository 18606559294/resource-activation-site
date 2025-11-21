/**
 * 全局DeepSeek客服聊天窗口初始化脚本
 * 用于确保客服功能在所有页面上可用
 */

import DeepSeekChatWidget from './modules/deepseek-chat-widget.js';
import i18n from '../i18n.js';

// 定义全局初始化函数
function initGlobalChat() {
    // 检查是否已经初始化
    if (window.deepseekChatWidget) {
        return;
    }
    
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
}

// 在DOM加载完成后初始化客服聊天窗口
document.addEventListener('DOMContentLoaded', initGlobalChat);

// 导出初始化函数，以便其他模块可以手动调用
export default initGlobalChat;