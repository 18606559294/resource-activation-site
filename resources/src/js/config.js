// 网站配置
const config = {
    // 安全配置
    security: {
        maxFileSize: 100 * 1024 * 1024, // 100MB
        allowedFileTypes: ['zip', 'exe', 'msi', 'iso'],
        maxRequestsPerMinute: 60
    },

    // 资源路径
    paths: {
        tools: '/tools',
        downloads: '/downloads',
        temp: '/temp'
    }
};

// 防止配置被修改
Object.freeze(config);

export default config;
