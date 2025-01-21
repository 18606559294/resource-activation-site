// DeepSeek AI 集成模块
import { DeepSeekChat } from './deepseek-chat.js';

class DeepSeekIntegration {
    // ...（其他代码不变）

    /** @param {string | undefined} apiKey - DeepSeek API密钥 */
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.apiKey = apiKey;
        this.init();
    }

    init() {
        try {
            // 使用传入的apiKey初始化聊天实例
            this.chatInstance = new DeepSeekChat();
            this.integrateWithPages();
        } catch (error) {
            console.error('Failed to initialize DeepSeek integration:', error);
        }
    }


    // ...（其他代码不变）
}


try {
    // 不传入apiKey，DeepSeekChat内部会处理解密逻辑
    const deepseekIntegration = new DeepSeekIntegration(undefined);
} catch (error) {
    console.error('Failed to initialize DeepSeek integration:', error);
}
