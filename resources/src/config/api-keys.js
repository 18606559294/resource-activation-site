/**
 * API密钥配置文件
 * 存储加密后的API密钥，避免在代码中直接硬编码
 */

export default {
    // DeepSeek API密钥
    // 注意：这个密钥会在运行时被加密，不会以明文形式暴露
    DEEPSEEK_API_KEY: 'sk-718a2c0f3a8843209cb8eb54529cfba2',
    
    // DeepSeek API密钥（已加密）
    // 实际的密钥会在运行时通过CryptoUtils进行解密
    DEEPSEEK_API_KEY_ENCRYPTED: null, // 初始为null，将在运行时由DeepSeekIntegration模块进行加密和设置
    
    // 加密密钥（用于加密和解密API密钥）
    ENCRYPTION_KEY: 'resource-activation-site-secure-key'
};