const DeepSeekChat = require('./deepseek-chat');
const crypto = require('crypto');

describe('DeepSeekChat', () => {
  let chatInstance;

  beforeAll(() => {
    // 设置测试环境
    process.env.ENCRYPTION_KEY = 'test-encryption-key-32-bytes-long-123';
    process.env.DEEPSEEK_API_KEY = 'test-api-key';
  });

  beforeEach(() => {
    // Clear existing DOM
    document.body.innerHTML = '';
    
    // Initialize instance which will create its own DOM
    chatInstance = new DeepSeekChat();
    
    // Add test IDs to container elements
    const container = document.querySelector('.deepseek-chat-container');
    if (container) {
      container.querySelector('.messages')?.setAttribute('data-testid', 'messages-container');
      container.querySelector('.chat-input')?.setAttribute('data-testid', 'chat-input');
      container.querySelector('.send-btn')?.setAttribute('data-testid', 'send-btn');
    }
    
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
    
    // Trigger send
    const sendBtn = document.querySelector('[data-testid="send-btn"]');
    sendBtn.click();
    
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
      const encrypted = chatInstance.encryptAPIKey(testKey);
      expect(encrypted).toMatch(/^[0-9a-f]{32}:[0-9a-f]+$/);
      
      const decrypted = chatInstance.decryptAPIKey(encrypted);
      expect(decrypted).toBe(testKey);
    });

    test('should handle invalid IV length', () => {
      // 测试格式正确的无效IV长度
      const invalidKey1 = '00112233445566778899aabbccddeeff:1234'; // 正确格式但数据无效
      const invalidKey2 = '1234:abcdef'; // IV长度不足
      
      // 验证错误类型和消息
      expect(chatInstance.decryptAPIKey(invalidKey1)).toBeUndefined();
      expect(chatInstance.decryptAPIKey(invalidKey2)).toBeUndefined();
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
        const result = chatInstance.decryptAPIKey(key);
        expect(result).toBeUndefined();
      });
    });
  });
});
