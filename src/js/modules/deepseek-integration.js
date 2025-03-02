// DeepSeek AI 集成模块
import { DeepSeekChat } from './deepseek-chat.js';
import { frontendDownloadManager } from './frontend-download-manager.js';

export class DeepSeekIntegration {
    constructor() {
        this.chatInstance = null;
        this.downloadManager = frontendDownloadManager;
        this.init();
    }

    init() {
        try {
            this.chatInstance = new DeepSeekChat();
            this.integrateWithPages();
        } catch (error) {
            console.error('Failed to initialize DeepSeek integration:', error);
        }
    }

    integrateWithPages() {
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
            this.setupChatCommands();
        }
    }

    addChatButton() {
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

    toggleChat() {
        if (this.chatInstance) {
            this.chatInstance.toggleChat();
        }
    }
    
    /**
     * 设置聊天命令
     * 允许用户通过聊天界面下载工具
     */
    setupChatCommands() {
        if (!this.chatInstance) return;
        
        // 添加下载命令处理
        this.chatInstance.addCommandHandler('download', async (params) => {
            if (!params || !params.toolId) {
                return { success: false, message: '请指定要下载的工具ID' };
            }
            
            try {
                const result = await this.downloadManager.downloadTool(params.toolId);
                return { 
                    success: !!result, 
                    message: result ? '下载已开始，请查看浏览器下载窗口' : '下载失败，请稍后重试' 
                };
            } catch (error) {
                console.error('聊天下载命令执行失败:', error);
                return { success: false, message: '下载失败: ' + error.message };
            }
        });
    }
}

// 初始化DeepSeek集成
try {
    new DeepSeekIntegration();
} catch (error) {
    console.error('Failed to initialize DeepSeek integration:', error);
}
