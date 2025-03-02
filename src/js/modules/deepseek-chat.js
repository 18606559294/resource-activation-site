// DeepSeek AI 智能客服模块 - 纯前端实现版本

class DeepSeekChat {
    constructor() {
        this.apiKey = undefined;
        this.chatContainer = null;
        this.messageHistory = [];

        // 初始化API密钥
        this.initializeApiKey();
    }

    /**
     * 初始化API密钥
     */
    initializeApiKey() {
        try {
            // 从window.ENV获取API密钥
            this.apiKey = window.ENV?.DEEPSEEK_API_KEY;
            
            if (!this.apiKey) {
                console.warn('DeepSeek API key not found, chat will be disabled');
                return;
            }

            this.initChat();
        } catch (error) {
            console.error('Failed to initialize API key:', error);
        }
    }

    /**
     * 初始化聊天界面
     */
    initChat() {
        try {
            this.createChatWindow();
            this.initEventListeners();
        } catch (error) {
            console.error('Failed to initialize chat:', error);
        }
    }

    /**
     * 创建聊天窗口
     */
    createChatWindow() {
        if (!document.body) {
            throw new Error('Document body not found');
        }

        this.chatContainer = document.createElement('div');
        this.chatContainer.className = 'deepseek-chat-container';
        this.chatContainer.innerHTML = `
            <div class="chat-header">
                <h3>智能客服</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="chat-body">
                <div class="messages"></div>
            </div>
            <div class="chat-footer">
                <input type="text" class="chat-input" placeholder="请输入您的问题..." />
                <button class="send-btn">发送</button>
            </div>
        `;
        document.body.appendChild(this.chatContainer);
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        if (!this.chatContainer) return;

        const sendBtn = this.chatContainer.querySelector('.send-btn');
        const closeBtn = this.chatContainer.querySelector('.close-btn');
        const input = this.chatContainer.querySelector('.chat-input');

        if (!sendBtn || !closeBtn || !input) {
            throw new Error('Failed to find required chat elements');
        }

        sendBtn.addEventListener('click', () => this.sendMessage());
        closeBtn.addEventListener('click', () => this.toggleChat());
        input.addEventListener('keydown', (e) => {
            if (e instanceof KeyboardEvent && e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    /**
     * 切换聊天窗口显示状态
     */
    toggleChat() {
        if (!this.chatContainer) return;
        this.chatContainer.classList.toggle('visible');
    }

    /**
     * 发送消息
     */
    async sendMessage() {
        if (!this.chatContainer) return;

        const input = this.chatContainer.querySelector('.chat-input');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // Clear input immediately
        input.value = '';

        // Add user message to DOM
        const userMessage = this.appendMessage('user', message);
        if (!userMessage) {
            throw new Error('Failed to append user message');
        }

        try {
            // Add loading indicator
            const loadingMessage = this.appendMessage('loading', '正在处理中...');
            if (!loadingMessage) {
                throw new Error('Failed to append loading message');
            }

            const response = await this.queryDeepSeek(message);
            
            // Remove loading indicator
            if (loadingMessage && loadingMessage.remove) {
                loadingMessage.remove();
            }
            
            // Add assistant response
            const assistantMessage = this.appendMessage('assistant', response);
            if (!assistantMessage) {
                throw new Error('Failed to append assistant message');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            
            // Remove loading indicator
            const loadingMessages = this.chatContainer.querySelectorAll('.message.loading');
            if (loadingMessages && loadingMessages.forEach) {
                loadingMessages.forEach(msg => msg.remove());
            }
            
            // Add error message
            const errorMessage = this.appendMessage('error', '抱歉，暂时无法连接到客服，请稍后再试。');
            if (!errorMessage) {
                throw new Error('Failed to append error message');
            }
        }
    }

    /**
     * 查询DeepSeek API
     * @param {string} message 用户消息
     * @returns {Promise<string>} 响应内容
     */
    async queryDeepSeek(message) {
        if (!message || !this.apiKey) {
            throw new Error('Message or API key is missing');
        }

        // 模拟API响应，实际项目中应替换为真实API调用
        // 由于这是纯前端实现，我们使用模拟响应代替实际API调用
        return new Promise((resolve) => {
            setTimeout(() => {
                const responses = [
                    '您好，我是智能客服助手。很高兴为您服务！',
                    '感谢您的咨询。请问还有其他问题吗？',
                    '您的问题我已经记录下来，我们会尽快处理。',
                    '这个问题比较复杂，建议您联系我们的人工客服。',
                    '您可以在工作时间（周一至周五 9:00-18:00）联系我们。',
                    '您可以查看我们的帮助文档获取更多信息。'
                ];
                const randomIndex = Math.floor(Math.random() * responses.length);
                resolve(responses[randomIndex]);
            }, 1000);
        });
    }

    /**
     * 添加消息到聊天窗口
     * @param {string} sender 发送者类型
     * @param {string} message 消息内容
     * @returns {HTMLElement} 消息元素
     */
    appendMessage(sender, message) {
        if (!this.chatContainer) {
            console.error('Chat container not found');
            return null;
        }

        const messagesDiv = this.chatContainer.querySelector('.messages');
        if (!messagesDiv) {
            console.error('Messages container not found');
            return null;
        }

        try {
            // Create message container with test ID
            const messageContainer = document.createElement('div');
            messageContainer.className = `message ${sender}`;
            messageContainer.setAttribute('data-testid', `${sender}-message`);

            // Create message content
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.textContent = message;

            // Create timestamp
            const timestamp = document.createElement('div');
            timestamp.className = 'timestamp';
            timestamp.textContent = new Date().toLocaleTimeString();

            // Append elements
            messageContainer.appendChild(messageContent);
            messageContainer.appendChild(timestamp);
            messagesDiv.appendChild(messageContainer);

            // Scroll to bottom
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            // Add to history if it's a user or assistant message
            if (sender === 'user' || sender === 'assistant') {
                this.messageHistory.push({
                    role: sender,
                    content: message,
                    timestamp: new Date().toISOString()
                });
            }

            // Return message container for testing purposes
            return messageContainer;
        } catch (error) {
            console.error('Failed to append message:', error);
            return null;
        }
    }

    /**
     * 初始化DeepSeek聊天
     * @param {Object} options 配置选项
     */
    static init(options = {}) {
        const instance = new DeepSeekChat();
        
        // 处理自定义容器
        if (options.container) {
            const container = typeof options.container === 'string' 
                ? document.querySelector(options.container)
                : options.container;
                
            if (container && instance.chatContainer) {
                // 如果找到了自定义容器，将聊天窗口移动到该容器中
                container.appendChild(instance.chatContainer);
            }
        }
        
        // 处理位置选项
        if (options.position && instance.chatContainer) {
            instance.chatContainer.classList.add(`position-${options.position}`);
        }
        
        // 处理API密钥
        if (options.apiKey) {
            instance.apiKey = options.apiKey;
        }
        
        // 默认显示聊天窗口
        if (instance.chatContainer) {
            setTimeout(() => {
                instance.chatContainer.classList.add('visible');
            }, 1000);
        }
        
        return instance;
    }
}

export default DeepSeekChat;
