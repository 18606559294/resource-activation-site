// DeepSeek AI 智能客服模块
import crypto from 'crypto';

export class DeepSeekChat {
    private encryptionKey: Buffer | null = null;
    private apiKey: string | undefined;
    private chatContainer: HTMLElement | null = null;
    private messageHistory: Array<{role: string, content: string}> = [];

    constructor() {
        this.initializeEncryption();
        // 从加密密钥中解密API密钥
        const encryptedApiKey = 'YOUR_ENCRYPTED_API_KEY'; // 将YOUR_ENCRYPTED_API_KEY替换为实际加密后的密钥
        this.apiKey = this.decryptAPIKey(encryptedApiKey) || process.env.DEEPSEEK_API_KEY;

        if (!this.apiKey) {
            console.warn('DeepSeek API key not found, chat will be disabled');
            return;
        }

        this.initChat();
    }

    private initializeEncryption(): void {
        try {
            this.encryptionKey = crypto.randomBytes(32);
        } catch (error) {
            console.error('Failed to initialize encryption:', error);
            throw new Error('Failed to initialize encryption');
        }
    }

    public initChat(): void {
        try {
            this.createChatWindow();
            this.initEventListeners();
        } catch (error) {
            console.error('Failed to initialize chat:', error);
        }
    }

    private createChatWindow(): void {
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

    private initEventListeners(): void {
        if (!this.chatContainer) return;

        const sendBtn = this.chatContainer.querySelector('.send-btn');
        const closeBtn = this.chatContainer.querySelector('.close-btn');
        const input = this.chatContainer.querySelector('.chat-input') as HTMLInputElement;

        if (!sendBtn || !closeBtn || !input) {
            throw new Error('Failed to find required chat elements');
        }

        sendBtn.addEventListener('click', () => this.sendMessage());
        closeBtn.addEventListener('click', () => this.toggleChat());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    public toggleChat(): void {
        if (!this.chatContainer) return;
        this.chatContainer.classList.toggle('visible');
    }

    private async sendMessage(): Promise<void> {
        if (!this.chatContainer) return;

        const input = this.chatContainer.querySelector('.chat-input') as HTMLInputElement;
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        this.appendMessage('user', message);
        input.value = '';

        try {
            const response = await this.queryDeepSeek(message);
            this.appendMessage('assistant', response);
        } catch (error) {
            console.error('Failed to send message:', error);
            this.appendMessage('error', '抱歉，暂时无法连接到客服，请稍后再试。');
        }
    }

    private async queryDeepSeek(message: string): Promise<string> {
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

    private appendMessage(sender: 'user' | 'assistant' | 'error', message: string): void {
        if (!this.chatContainer) return;

        const messagesDiv = this.chatContainer.querySelector('.messages');
        if (!messagesDiv) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.textContent = message;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        if (sender !== 'error') {
            this.messageHistory.push({
                role: sender,
                content: message
            });
        }
    }

    private decryptAPIKey(encryptedKey: string): string | undefined {
        if (!encryptedKey || !this.encryptionKey) return undefined;
        try {
            const [ivHex, encryptedData] = encryptedKey.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv(
                'aes-256-cbc',
                this.encryptionKey,
                iv
            );
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            console.error('Failed to decrypt API key:', error);
            return undefined;
        }
    }
}
