// DeepSeek AI 智能客服模块
import crypto from 'crypto';

export class DeepSeekChat {
    // ...（其他代码不变）

    constructor() {
        this.#initializeEncryption();
        // 从加密密钥中解密API密钥
        const encryptedApiKey = 'YOUR_ENCRYPTED_API_KEY'; // 将YOUR_ENCRYPTED_API_KEY替换为实际加密后的密钥
        this.#apiKey = this.#decryptAPIKey(encryptedApiKey) || process.env.DEEPSEEK_API_KEY;

        if (!this.#apiKey) {
            console.warn('DeepSeek API key not found, chat will be disabled');
            return;
        }

        this.initChat();
        this.messageHistory = [];
    }

    // ...（其他代码不变）
}

// ...（其他代码不变）
