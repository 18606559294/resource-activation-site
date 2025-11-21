// DeepSeek API 集成模块 - 仅用于API调用，不包含客服窗口
import { frontendDownloadManager } from './frontend-download-manager.js';
import CryptoUtils from './crypto-utils.js';

export class DeepSeekIntegration {
    constructor() {
        this.downloadManager = frontendDownloadManager;
        this.init();
    }

    async init() {
        try {
            // 设置环境变量，确保API密钥可用但已加密
            if (!window.ENV) window.ENV = {};
            
            // 导入API密钥配置
            const apiKeysConfig = await import('../../../src/config/api-keys.js');
            
            // 从配置文件中获取API密钥（如果已经存在于配置中）
            if (!apiKeysConfig.default.DEEPSEEK_API_KEY) {
                console.error('DeepSeek API密钥未在配置文件中设置');
                return;
            }
            
            // 加密的API密钥
            const encryptedApiKey = await CryptoUtils.encrypt(apiKeysConfig.default.DEEPSEEK_API_KEY, apiKeysConfig.default.ENCRYPTION_KEY);
            window.ENV.DEEPSEEK_API_KEY_ENCRYPTED = encryptedApiKey;
            
            console.log('DeepSeek API integration initialized with encrypted key');
        } catch (error) {
            console.error('Failed to initialize DeepSeek integration:', error);
        }
    }
    
    /**
     * 获取解密后的API密钥
     * @returns {Promise<string>} 解密后的API密钥
     */
    async getApiKey() {
        try {
            if (!window.ENV?.DEEPSEEK_API_KEY_ENCRYPTED) {
                throw new Error('Encrypted API key not found');
            }
            
            // 导入API密钥配置
            const apiKeysConfig = await import('../../../src/config/api-keys.js');
            
            return await CryptoUtils.decrypt(
                window.ENV.DEEPSEEK_API_KEY_ENCRYPTED, 
                apiKeysConfig.default.ENCRYPTION_KEY
            );
        } catch (error) {
            console.error('Failed to decrypt API key:', error);
            throw new Error('API key decryption failed');
        }
    }
}

// 初始化DeepSeek集成
try {
    new DeepSeekIntegration();
} catch (error) {
    console.error('Failed to initialize DeepSeek integration:', error);
}
