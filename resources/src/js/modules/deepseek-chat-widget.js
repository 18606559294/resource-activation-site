/**
 * DeepSeek 客服聊天窗口模块
 * 提供在网站左下角显示的客服聊天功能
 */

import DeepSeekAPI from './deepseek-api.js';
import CryptoUtils from './crypto-utils.js';
import i18n from '../../i18n.js';

class DeepSeekChatWidget {
    constructor() {
        this.apiKey = null;
        this.api = null;
        this.chatHistory = [];
        this.isOpen = false;
         this.isInitialized = false;
        this.encryptionKey = null; // 将在初始化时从配置文件加载
        
        // 创建DOM元素
        this.createWidgetElements();
        
        // 初始化
        this.initialize();
    }
    
    /**
     * 初始化聊天窗口
     */
    async initialize() {
        try {
            // 获取加密的API密钥
            const encryptedApiKey = window.ENV?.DEEPSEEK_API_KEY_ENCRYPTED;
            
            if (!encryptedApiKey) {
                // 导入API密钥配置
                const apiKeysConfig = await import('../../../src/config/api-keys.js');
                
                // 如果没有加密的API密钥，则从DeepSeekIntegration获取
                try {
                    const { DeepSeekIntegration } = await import('./deepseek-integration.js');
                    const integration = new DeepSeekIntegration();
                    // 等待初始化完成，确保API密钥已加密并存储在window.ENV中
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // 使用已加密的API密钥
                    this.apiKey = await CryptoUtils.decrypt(
                        window.ENV.DEEPSEEK_API_KEY_ENCRYPTED,
                        apiKeysConfig.default.ENCRYPTION_KEY
                    );
                } catch (error) {
                    console.error('Failed to get API key from DeepSeekIntegration:', error);
                    throw new Error('API key initialization failed');
                }
            } else {
                // 导入API密钥配置
                const apiKeysConfig = await import('../../../src/config/api-keys.js');
                
                // 解密API密钥
                this.apiKey = await CryptoUtils.decrypt(encryptedApiKey, apiKeysConfig.default.ENCRYPTION_KEY);
            }
            
            // 初始化API
            this.api = new DeepSeekAPI(this.apiKey);
            this.isInitialized = true;
            
            console.log(i18n.t('deepseek.logs.initialized', 'DeepSeek 客服聊天窗口已初始化'));
        } catch (error) {
            console.error(i18n.t('deepseek.logs.initFailed', '初始化DeepSeek客服聊天窗口失败:'), error);
            this.showError(i18n.t('deepseek.errors.initFailed', '客服系统初始化失败，请稍后再试'));
        }
    }
    
    /**
     * 创建聊天窗口DOM元素
     */
    createWidgetElements() {
        // 创建主容器
        this.container = document.createElement('div');
        this.container.className = 'deepseek-chat-widget';
        // 修改位置到左侧，与CSS保持一致
        this.container.style.left = '20px';
        this.container.style.top = '100px';
        this.container.style.right = 'auto';
        this.container.style.bottom = 'auto';
        
        // 创建聊天按钮
        this.chatButton = document.createElement('button');
        this.chatButton.className = 'deepseek-chat-button';
        this.chatButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
        this.chatButton.setAttribute('aria-label', i18n.t('deepseek.openChat', '打开客服聊天'));
        
        // 创建聊天窗口
        this.chatWindow = document.createElement('div');
        this.chatWindow.className = 'deepseek-chat-window';
        this.chatWindow.style.display = 'none';
        
        // 创建聊天窗口头部
        const header = document.createElement('div');
        header.className = 'deepseek-chat-header';
        
        const title = document.createElement('h3');
        title.textContent = i18n.t('deepseek.title', '在线客服');
        
        const closeButton = document.createElement('button');
        closeButton.className = 'deepseek-chat-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', i18n.t('deepseek.closeChat', '关闭聊天窗口'));
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // 创建聊天消息区域
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'deepseek-chat-messages';
        
        // 添加欢迎消息和引导语
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'deepseek-chat-message assistant';
        welcomeMessage.innerHTML = i18n.t('deepseek.welcomeMessage', '您好！我是AI客服助手，很高兴为您服务。<br><br>您可以咨询以下问题：<br>1. 产品功能与使用方法<br>2. 账户激活与订阅问题<br>3. 技术支持与故障排除<br>4. 付款与发票相关<br><br>请告诉我您需要什么帮助？');
        this.messagesContainer.appendChild(welcomeMessage);
        
        // 创建输入区域
        const inputArea = document.createElement('div');
        inputArea.className = 'deepseek-chat-input-area';
        
        this.messageInput = document.createElement('textarea');
        this.messageInput.className = 'deepseek-chat-input';
        this.messageInput.placeholder = i18n.t('deepseek.inputPlaceholder', '请输入您的问题...');
        this.messageInput.rows = 1;
        
        const sendButton = document.createElement('button');
        sendButton.className = 'deepseek-chat-send';
        sendButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
        sendButton.setAttribute('aria-label', i18n.t('deepseek.sendMessage', '发送消息'));
        
        inputArea.appendChild(this.messageInput);
        inputArea.appendChild(sendButton);
        
        // 组装聊天窗口
        this.chatWindow.appendChild(header);
        this.chatWindow.appendChild(this.messagesContainer);
        this.chatWindow.appendChild(inputArea);
        
        // 添加到主容器
        this.container.appendChild(this.chatButton);
        this.container.appendChild(this.chatWindow);
        
        // 添加到body
        document.body.appendChild(this.container);
        
        // 添加事件监听
        this.chatButton.addEventListener('click', () => this.toggleChat());
        closeButton.addEventListener('click', () => this.toggleChat(false));
        sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 自动调整输入框高度
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = (this.messageInput.scrollHeight) + 'px';
        });
    }
    
    /**
     * 切换聊天窗口显示状态
     * @param {boolean} [force] 强制设置状态
     */
    toggleChat(force) {
        this.isOpen = force !== undefined ? force : !this.isOpen;
        this.chatWindow.style.display = this.isOpen ? 'flex' : 'none';
        
        if (this.isOpen) {
            this.messageInput.focus();
            this.scrollToBottom();
        }
    }
    
    /**
     * 发送消息到DeepSeek API
     */
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        if (!this.isInitialized) {
            this.showError(i18n.t('deepseek.errors.initializing', '客服系统正在初始化，请稍后再试'));
            return;
        }
        
        // 清空输入框
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        
        // 添加用户消息到聊天窗口
        this.addMessage(message, 'user');
        
        // 显示加载状态
        const loadingId = this.showLoading();
        
        try {
            // 发送请求到DeepSeek API
            const response = await this.api.chat(message, this.chatHistory);
            
            // 移除加载状态
            this.removeLoading(loadingId);
            
            // 添加回复到聊天窗口
            this.addMessage(response, 'assistant');
            
            // 更新聊天历史
            this.chatHistory.push({ role: 'user', content: message });
            this.chatHistory.push({ role: 'assistant', content: response });
            
            // 如果历史记录太长，删除最早的消息
            if (this.chatHistory.length > 10) {
                this.chatHistory = this.chatHistory.slice(this.chatHistory.length - 10);
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            
            // 移除加载状态
            this.removeLoading(loadingId);
            
            // 显示错误消息
            this.showError(i18n.t('deepseek.errors.sendFailed', '消息发送失败，请稍后再试'));
        }
    }
    
    /**
     * 添加消息到聊天窗口
     * @param {string} content 消息内容
     * @param {string} role 角色 (user/assistant)
     */
    addMessage(content, role) {
        const messageElement = document.createElement('div');
        messageElement.className = `deepseek-chat-message ${role}`;
        
        // 处理可能的markdown内容
        if (role === 'assistant') {
            // 简单处理换行和链接
            content = content
                .replace(/\n/g, '<br>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        }
        
        messageElement.innerHTML = content;
        this.messagesContainer.appendChild(messageElement);
        
        this.scrollToBottom();
    }
    
    /**
     * 显示加载状态
     * @returns {string} 加载状态的唯一ID
     */
    showLoading() {
        const id = 'loading-' + Date.now();
        const loadingElement = document.createElement('div');
        loadingElement.className = 'deepseek-chat-message assistant loading';
        loadingElement.id = id;
        loadingElement.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        
        this.messagesContainer.appendChild(loadingElement);
        this.scrollToBottom();
        
        return id;
    }
    
    /**
     * 移除加载状态
     * @param {string} id 加载状态的唯一ID
     */
    removeLoading(id) {
        const loadingElement = document.getElementById(id);
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    /**
     * 显示错误消息
     * @param {string} message 错误消息
     */
    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'deepseek-chat-message error';
        errorElement.textContent = message;
        
        this.messagesContainer.appendChild(errorElement);
        this.scrollToBottom();
        
        // 5秒后自动移除错误消息
        setTimeout(() => {
            errorElement.classList.add('fade-out');
            setTimeout(() => errorElement.remove(), 500);
        }, 5000);
    }
    
    /**
     * 滚动到聊天窗口底部
     */
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

export default DeepSeekChatWidget;