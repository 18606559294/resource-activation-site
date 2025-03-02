/**
 * DeepSeek 客服聊天模块
 * 提供网站客服聊天功能的接口
 */

import DeepSeekChatWidget from './deepseek-chat-widget.js';

/**
 * DeepSeek客服聊天模块
 * 提供初始化和管理客服聊天窗口的功能
 */
const DeepSeekChat = {
    /**
     * 聊天窗口实例
     */
    widget: null,
    
    /**
     * 初始化客服聊天窗口
     * @param {Object} options 配置选项
     * @param {string} options.container 容器选择器
     * @param {string} options.position 位置，可选值：'bottom-right'(默认), 'bottom-left', 'top-right', 'top-left'
     */
    init(options = {}) {
        try {
            // 创建聊天窗口实例
            this.widget = new DeepSeekChatWidget();
            
            // 设置位置
            if (options.position) {
                const container = this.widget.container;
                // 移除所有位置类
                container.classList.remove('bottom-right', 'bottom-left', 'top-right', 'top-left');
                // 添加指定位置类
                container.classList.add(options.position);
            }
            
            console.log('DeepSeek客服聊天窗口已初始化');
            return this.widget;
        } catch (error) {
            console.error('初始化DeepSeek客服聊天窗口失败:', error);
            return null;
        }
    },
    
    /**
     * 打开聊天窗口
     */
    open() {
        if (this.widget) {
            this.widget.toggleChat(true);
        } else {
            console.warn('聊天窗口尚未初始化');
        }
    },
    
    /**
     * 关闭聊天窗口
     */
    close() {
        if (this.widget) {
            this.widget.toggleChat(false);
        } else {
            console.warn('聊天窗口尚未初始化');
        }
    },
    
    /**
     * 发送消息
     * @param {string} message 消息内容
     */
    sendMessage(message) {
        if (this.widget) {
            this.widget.messageInput.value = message;
            this.widget.sendMessage();
        } else {
            console.warn('聊天窗口尚未初始化');
        }
    }
};

export default DeepSeekChat;
