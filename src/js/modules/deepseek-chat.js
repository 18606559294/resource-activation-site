// DeepSeek AI 智能客服模块
const crypto = require('crypto');

module.exports = class DeepSeekChat {
    constructor() {
        this.encryptionKey = null;
        this.apiKey = undefined;
        this.chatContainer = null;
        this.messageHistory = [];

        this.initializeEncryption();
        const encryptedApiKey = 'YOUR_ENCRYPTED_API_KEY';
        this.apiKey = this.decryptAPIKey(encryptedApiKey) || process.env.DEEPSEEK_API_KEY;

        if (!this.apiKey) {
            console.warn('DeepSeek API key not found, chat will be disabled');
            return;
        }

        this.initChat();
    }

    initializeEncryption() {
        try {
            const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-bytes-long-123456';
            this.encryptionKey = Buffer.alloc(32);
            Buffer.from(key).copy(this.encryptionKey);
        } catch (error) {
            console.error('Failed to initialize encryption:', error);
            throw new Error('Failed to initialize encryption');
        }
    }

    initChat() {
        try {
            this.createChatWindow();
            this.initEventListeners();
        } catch (error) {
            console.error('Failed to initialize chat:', error);
        }
    }

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

    toggleChat() {
        if (!this.chatContainer) return;
        this.chatContainer.classList.toggle('visible');
    }

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

    async queryDeepSeek(message) {
        if (!message || !this.apiKey) {
            throw new Error('Message or API key is missing');
        }

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    ...this.messageHistory,
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

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

    decryptAPIKey(encryptedKey) {
        if (!encryptedKey || !this.encryptionKey) return undefined;
        try {
            // Validate encrypted key format
            if (typeof encryptedKey !== 'string' || encryptedKey.split(':').length !== 2) {
                throw new Error('Invalid encrypted key format');
            }
            
            const [ivHex, encryptedData] = encryptedKey.split(':');
            
            // Validate IV
            const iv = Buffer.from(ivHex, 'hex');
            if (iv.length !== 16) {
                throw new Error(`Invalid IV length: Expected 16 bytes, got ${iv.length}`);
            }

            // Validate encrypted data
            if (!encryptedData || !/^[0-9a-f]+$/i.test(encryptedData)) {
                throw new Error('Invalid encrypted data format');
            }

            const decipher = crypto.createDecipheriv(
                'aes-256-cbc',
                this.encryptionKey,
                iv
            );
            
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            // Validate decrypted result
            if (typeof decrypted !== 'string' || decrypted.length === 0) {
                throw new Error('Decryption returned empty result');
            }
            
            return decrypted;
        } catch (error) {
            console.error('Failed to decrypt API key:', error);
            return undefined;
        }
    }

    encryptAPIKey(plainText) {
        if (!plainText || !this.encryptionKey) return '';
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(
                'aes-256-cbc',
                this.encryptionKey,
                iv
            );
            let encrypted = cipher.update(plainText, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return `${iv.toString('hex')}:${encrypted}`;
        } catch (error) {
            console.error('Failed to encrypt API key:', error);
            return '';
        }
    }
}
