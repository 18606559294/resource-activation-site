// 网站配置
const config = {
    // API endpoints
    endpoints: {
        toolbox: '/toolbox',  // 工具箱路径，将由后端处理
        feedback: '/api/feedback',
        resources: '/api/resources'
    },
    
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
