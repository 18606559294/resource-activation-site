// DeepSeek AI 智能客服模块
export class DeepSeekChat {
  /** @type {string} */
  apiKey = '';
  /** @type {HTMLElement | null} */
  chatContainer = null;
  
  /**
   * @param {string} apiKey - DeepSeek API密钥
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey;
    this.initChat();
  }

  initChat() {
    try {
      // 创建聊天窗口
      this.createChatWindow();
      // 初始化事件监听
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
    this.chatContainer.className = 'deepseek-chat';
    this.chatContainer.innerHTML = `
      <div class="chat-window">
        <div class="chat-header">
          <h3>智能客服</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="chat-body"></div>
        <div class="chat-input">
          <input type="text" placeholder="请输入您的问题..." />
          <button class="send-btn">发送</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.chatContainer);
  }

  initEventListeners() {
    if (!this.chatContainer) return;

    const sendBtn = this.chatContainer.querySelector('.send-btn');
    const closeBtn = this.chatContainer.querySelector('.close-btn');
    const input = this.chatContainer.querySelector('input');

    if (!sendBtn || !closeBtn || !input) {
      throw new Error('Failed to find required chat elements');
    }

    // 发送消息
    sendBtn.addEventListener('click', () => this.sendMessage());
    // 关闭窗口
    closeBtn.addEventListener('click', () => this.toggleChat());
    // 回车发送
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  async sendMessage() {
    if (!this.chatContainer) return;

    const input = this.chatContainer.querySelector('input');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    // 显示用户消息
    this.appendMessage('user', message);
    input.value = '';

    try {
      // 调用DeepSeek API
      const response = await this.queryDeepSeek(message);
      // 显示AI回复
      this.appendMessage('ai', response);
    } catch (error) {
      console.error('Failed to send message:', error);
      this.appendMessage('error', '抱歉，暂时无法连接到客服，请稍后再试。');
    }
  }

  /**
   * 向DeepSeek API发送请求
   * @param {string} message - 用户消息
   * @returns {Promise<string>} - AI回复
   */
  async queryDeepSeek(message) {
    if (!message) {
      throw new Error('Message is required');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    return data.choices[0].message.content;
  }

  /**
   * 添加消息到聊天窗口
   * @param {'user' | 'ai' | 'error'} sender - 消息发送者
   * @param {string} message - 消息内容
   */
  appendMessage(sender, message) {
    if (!this.chatContainer) return;

    const chatBody = this.chatContainer.querySelector('.chat-body');
    if (!chatBody) return;

    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.textContent = message;
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  toggleChat() {
    if (!this.chatContainer) return;
    this.chatContainer.classList.toggle('hidden');
  }
}

// 初始化智能客服
try {
  const deepseekChat = new DeepSeekChat('sk-718a2c0f3a8843209cb8eb54529cfba2');
} catch (error) {
  console.error('Failed to initialize DeepSeek chat:', error);
}
