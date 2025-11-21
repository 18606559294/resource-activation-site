// DeepSeek AI 集成模块
import { DeepSeekChat } from './deepseek-chat.js';

export class DeepSeekIntegration {
    private chatInstance: DeepSeekChat | null = null;

    constructor() {
        this.init();
    }

    private init(): void {
        try {
            this.chatInstance = new DeepSeekChat();
            this.integrateWithPages();
        } catch (error) {
            console.error('Failed to initialize DeepSeek integration:', error);
        }
    }

    private integrateWithPages(): void {
        const pages = [
            'index.html',
            'resources.html',
            'security.html',
            'status.html',
            'toolbox.html',
            'feedback.html'
        ];

        if (this.chatInstance) {
            this.addChatButton();
        }
    }

    private addChatButton(): void {
        const chatButton = document.createElement('button');
        chatButton.id = 'deepseek-chat-button';
        chatButton.className = 'chat-trigger-button';
        chatButton.textContent = '智能客服';
        chatButton.addEventListener('click', () => this.toggleChat());

        const header = document.querySelector('header');
        if (header) {
            header.appendChild(chatButton);
        }
    }

    private toggleChat(): void {
        if (this.chatInstance) {
            this.chatInstance.toggleChat();
        }
    }
}

// 初始化DeepSeek集成
try {
    new DeepSeekIntegration();
} catch (error) {
    console.error('Failed to initialize DeepSeek integration:', error);
}
