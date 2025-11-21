import config from './config.js';

// 请求频率限制
const requestCounts = new Map();

// 安全检查中间件
export const SecurityMiddleware = {
    // 检查文件类型
    validateFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        return config.security.allowedFileTypes.includes(ext);
    },

    // 检查文件大小
    validateFileSize(size) {
        return size <= config.security.maxFileSize;
    },

    // 请求频率限制
    checkRateLimit(clientIP) {
        const now = Date.now();
        const minute = Math.floor(now / 60000);
        
        const key = `${clientIP}-${minute}`;
        const count = requestCounts.get(key) || 0;
        
        if (count >= config.security.maxRequestsPerMinute) {
            return false;
        }
        
        requestCounts.set(key, count + 1);
        
        // 清理旧的记录
        for (const [key, value] of requestCounts) {
            const [ip, recordMinute] = key.split('-');
            if (minute - recordMinute > 1) {
                requestCounts.delete(key);
            }
        }
        
        return true;
    },

    // XSS 防护
    sanitizeInput(input) {
        return input.replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    },

    // CSRF 令牌生成
    generateCSRFToken() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
};

// 添加全局错误处理
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // 可以在这里添加错误上报逻辑
});

// 添加未处理的Promise拒绝处理
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // 可以在这里添加错误上报逻辑
});
