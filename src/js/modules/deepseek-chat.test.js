const DeepSeekChat = require('./deepseek-chat.js');
const crypto = require('crypto');

describe('DeepSeekChat', () => {
  /** @type {DeepSeekChat} */
  let chatInstance;
  const testApiKey = 'test-api-key';

  beforeAll(() => {
    // 模拟加密密钥
    const encryptionKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(testApiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    process.env.DEEPSEEK_API_KEY = testApiKey;
  });

  beforeEach(() => {
    chatInstance = new DeepSeekChat();
    document.body.innerHTML = '';
  });

  test('should initialize chat window', () => {
    expect(document.querySelector('.deepseek-chat-container')).not.toBeNull();
  });

  test('should send and display user message', () => {
    const input = /** @type {HTMLInputElement} */ (document.querySelector('.chat-input'));
    const sendBtn = /** @type {HTMLButtonElement} */ (document.querySelector('.send-btn'));
    
    if (!input || !sendBtn) {
      throw new Error('Failed to find chat elements');
    }
    
    input.value = 'Test message';
    sendBtn.click();
    
    const messages = document.querySelectorAll('.message.user');
    expect(messages.length).toBe(1);
    expect(messages[0].textContent).toBe('Test message');
  });

  test('should handle API response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response(JSON.stringify({
        choices: [{
          message: {
            content: 'Test response'
          }
        }]
      }), {
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }))
    );

    const input = /** @type {HTMLInputElement} */ (document.querySelector('.chat-input'));
    const sendBtn = /** @type {HTMLButtonElement} */ (document.querySelector('.send-btn'));
    
    if (!input || !sendBtn) {
      throw new Error('Failed to find chat elements');
    }
    
    input.value = 'Test message';
    await sendBtn.click();
    
    const messages = document.querySelectorAll('.message.assistant');
    expect(messages.length).toBe(1);
    expect(messages[0].textContent).toBe('Test response');
  });

  test('should handle API errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response(null, {
        status: 500,
        statusText: 'Internal Server Error'
      }))
    );

    const input = /** @type {HTMLInputElement} */ (document.querySelector('.chat-input'));
    const sendBtn = /** @type {HTMLButtonElement} */ (document.querySelector('.send-btn'));
    
    if (!input || !sendBtn) {
      throw new Error('Failed to find chat elements');
    }
    
    input.value = 'Test message';
    await sendBtn.click();
    
    const messages = document.querySelectorAll('.message.error');
    expect(messages.length).toBe(1);
    expect(messages[0].textContent).toContain('抱歉');
  });

  test('should decrypt API key correctly', () => {
    const encryptedKey = chatInstance.decryptAPIKey('test-encrypted-key');
    expect(encryptedKey).toBe(testApiKey);
  });
});
