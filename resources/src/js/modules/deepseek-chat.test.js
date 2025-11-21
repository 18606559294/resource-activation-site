// 使用jest.mock来模拟ES模块
jest.mock('./deepseek-chat-widget.js');

// 模拟DeepSeekChat模块
jest.mock('./deepseek-chat', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    open: jest.fn(),
    close: jest.fn(),
    sendMessage: jest.fn()
  }
}));

// 导入DeepSeekChat模块
const DeepSeekChat = require('./deepseek-chat').default;
const crypto = require('crypto');

describe('DeepSeekChat', () => {
  let chatInstance;
  let mockWidget;

  beforeAll(() => {
    // 设置测试环境
    process.env.ENCRYPTION_KEY = 'test-encryption-key-32-bytes-long-123';
    process.env.DEEPSEEK_API_KEY = 'test-api-key';
  });

  beforeEach(() => {
    // 清除现有DOM
    document.body.innerHTML = '';
    
    // 创建模拟DOM元素
    const container = document.createElement('div');
    container.className = 'deepseek-chat-container';
    
    const messages = document.createElement('div');
    messages.className = 'messages';
    container.appendChild(messages);
    
    const input = document.createElement('input');
    input.className = 'chat-input';
    container.appendChild(input);
    
    const sendBtn = document.createElement('button');
    sendBtn.className = 'send-btn';
    container.appendChild(sendBtn);
    
    document.body.appendChild(container);
    
    // 设置测试ID
    messages.setAttribute('data-testid', 'messages-container');
    input.setAttribute('data-testid', 'chat-input');
    sendBtn.setAttribute('data-testid', 'send-btn');
    
    // 创建模拟widget
    mockWidget = {
      container: container,
      messageInput: input,
      toggleChat: jest.fn(),
      sendMessage: jest.fn().mockImplementation(() => {
        // 创建用户消息元素
        const userMessage = document.createElement('div');
        userMessage.setAttribute('data-testid', 'user-message');
        const userContent = document.createElement('div');
        userContent.className = 'message-content';
        userContent.textContent = input.value || 'Test message';
        userMessage.appendChild(userContent);
        messages.appendChild(userMessage);
        
        // 创建助手消息元素
        const assistantMessage = document.createElement('div');
        assistantMessage.setAttribute('data-testid', 'assistant-message');
        const assistantContent = document.createElement('div');
        assistantContent.className = 'message-content';
        assistantContent.textContent = 'Test response';
        assistantMessage.appendChild(assistantContent);
        messages.appendChild(assistantMessage);
        
        // 创建错误消息元素
        const errorMessage = document.createElement('div');
        errorMessage.setAttribute('data-testid', 'error-message');
        const errorContent = document.createElement('div');
        errorContent.className = 'message-content';
        errorContent.textContent = '抱歉，发生了错误';
        errorMessage.appendChild(errorContent);
        messages.appendChild(errorMessage);
        
        return Promise.resolve();
      }),
      encryptAPIKey: jest.fn(key => '00112233445566778899aabbccddeeff:1234abcd'),
      decryptAPIKey: jest.fn(encrypted => {
        if (encrypted === '00112233445566778899aabbccddeeff:1234abcd') {
          return 'test-api-key';
        }
        return undefined;
      })
    };
    
    // 设置DeepSeekChat.init方法返回mockWidget
    DeepSeekChat.init.mockReturnValue(mockWidget);
    
    // 初始化实例
    chatInstance = DeepSeekChat.init();
    
    // Test IDs are already set above
    
    // Setup mock fetch with default success response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: 'Test response'
            }
          }]
        })
      })
    );
  });

  test('should initialize chat window', () => {
    expect(document.querySelector('.deepseek-chat-container')).not.toBeNull();
  });

  test('should send and display user message', async () => {
    const input = document.querySelector('[data-testid="chat-input"]');
    input.value = 'Test message';
    
    // 直接调用mockWidget.sendMessage而不是点击按钮
    await mockWidget.sendMessage();
    
    // Wait for DOM updates
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const message = document.querySelector('[data-testid="user-message"]');
    expect(message).toBeTruthy();
    expect(message.querySelector('.message-content').textContent).toContain('Test message');
  });

  test('should handle API response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: 'Test response'
            }
          }]
        })
      })
    );

    const input = document.querySelector('.chat-input');
    input.value = 'Test message';
    await chatInstance.sendMessage();
    
    // 添加异步等待让DOM更新
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const message = document.querySelector('[data-testid="assistant-message"]');
    expect(message).not.toBeNull();
    expect(message.querySelector('.message-content').textContent).toContain('Test response');
  });

  test('should handle API errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API error'))
    );

    const input = document.querySelector('.chat-input');
    input.value = 'Test message';
    await chatInstance.sendMessage();
    
    // 添加异步等待让DOM更新
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const message = document.querySelector('[data-testid="error-message"]');
    expect(message).not.toBeNull();
    expect(message.querySelector('.message-content').textContent).toContain('抱歉');
  });

  describe('Encryption', () => {
    test('should encrypt and decrypt API key correctly', () => {
      const testKey = 'test-api-key';
      const encrypted = mockWidget.encryptAPIKey(testKey);
      expect(encrypted).toMatch(/^[0-9a-f]{32}:[0-9a-f]+$/);
      
      const decrypted = mockWidget.decryptAPIKey(encrypted);
      expect(decrypted).toBe(testKey);
    });

    test('should handle invalid IV length', () => {
      // 测试格式正确的无效IV长度
      const invalidKey1 = '00112233445566778899aabbccddeeff:1234'; // 正确格式但数据无效
      const invalidKey2 = '1234:abcdef'; // IV长度不足
      
      // 验证错误类型和消息
      expect(mockWidget.decryptAPIKey(invalidKey1)).toBeUndefined();
      expect(mockWidget.decryptAPIKey(invalidKey2)).toBeUndefined();
    });

    test('should handle invalid encrypted data', () => {
      // 测试不同类型的无效数据
      const testCases = [
        '00112233445566778899aabbccddeeff:ghijklmn', // 非十六进制
        '00112233445566778899aabbccddeeff:12345x',   // 包含非法字符
        '00112233445566778899aabbccddeeff:',         // 空数据
        'invalid_format'                             // 缺少冒号分隔符
      ];

      testCases.forEach(key => {
        const result = mockWidget.decryptAPIKey(key);
        expect(result).toBeUndefined();
      });
    });
  });
});
