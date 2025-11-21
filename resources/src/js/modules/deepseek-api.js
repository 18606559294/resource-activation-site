/**
 * DeepSeek API 集成模块
 * 提供与DeepSeek API的通信功能
 */

class DeepSeekAPI {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('API密钥不能为空');
        }
        this.apiKey = apiKey;
        this.apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
        this.model = 'deepseek-chat';
    }

    /**
     * 发送聊天请求到DeepSeek API
     * @param {Array} messages 消息历史
     * @returns {Promise<Object>} API响应
     */
    async sendChatRequest(messages) {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error('消息不能为空');
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API请求失败: ${response.status} ${errorData.error?.message || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('DeepSeek API请求失败:', error);
            throw error;
        }
    }

    /**
     * 简化的聊天请求方法
     * @param {string} userMessage 用户消息
     * @param {Array} history 历史消息
     * @returns {Promise<string>} 助手回复
     */
    async chat(userMessage, history = []) {
        if (!userMessage) {
            throw new Error('用户消息不能为空');
        }

        // 格式化历史记录和当前消息
        const messages = [
            ...history,
            { role: 'user', content: userMessage }
        ];

        try {
            const response = await this.sendChatRequest(messages);
            
            if (response.choices && response.choices.length > 0) {
                return response.choices[0].message.content;
            }
            
            throw new Error('API响应格式不正确');
        } catch (error) {
            console.error('聊天请求失败:', error);
            throw error;
        }
    }

    /**
     * 设置API密钥
     * @param {string} apiKey 新的API密钥
     */
    setApiKey(apiKey) {
        if (!apiKey) {
            throw new Error('API密钥不能为空');
        }
        this.apiKey = apiKey;
    }

    /**
     * 设置模型
     * @param {string} model 模型名称
     */
    setModel(model) {
        if (!model) {
            throw new Error('模型名称不能为空');
        }
        this.model = model;
    }
}

export default DeepSeekAPI;