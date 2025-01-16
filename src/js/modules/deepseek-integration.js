// DeepSeek AI 集成模块
import { DeepSeekChat } from './deepseek-chat.js';

class DeepSeekIntegration {
  /** @type {string} */
  apiKey = '';
  /** @type {DeepSeekChat | null} */
  chatInstance = null;

  /** @param {string} apiKey - DeepSeek API密钥 */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey;
    this.init();
  }

  init() {
    try {
      // 初始化聊天实例
      this.chatInstance = new DeepSeekChat(this.apiKey);
      // 初始化页面集成
      this.integrateWithPages();
    } catch (error) {
      console.error('Failed to initialize DeepSeek integration:', error);
    }
  }

  integrateWithPages() {
    // 获取所有页面
    const pages = [
      'index.html',
      'resources.html',
      'security.html',
      'status.html',
      'toolbox.html',
      'feedback.html'
    ];

    // 为每个页面添加智能客服
    pages.forEach(page => {
      if (window.location.pathname.endsWith(page)) {
        this.addChatToPage();
      }
    });
  }

  addChatToPage() {
    if (!this.chatInstance) return;

    // 添加聊天按钮
    const chatButton = document.createElement('button');
    chatButton.id = 'deepseek-chat-button';
    chatButton.textContent = '智能客服';
    chatButton.addEventListener('click', () => this.toggleChat());

    // 将按钮添加到页面
    const header = document.querySelector('header');
    if (header) {
      header.appendChild(chatButton);
    }
  }

  toggleChat() {
    if (!this.chatInstance) return;
    this.chatInstance.toggleChat();
  }
}

// 初始化DeepSeek集成
try {
  const deepseekIntegration = new DeepSeekIntegration('sk-718a2c0f3a8843209cb8eb54529cfba2');
} catch (error) {
  console.error('Failed to initialize DeepSeek integration:', error);
}
