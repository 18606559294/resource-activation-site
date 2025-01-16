class DownloadManager {
    constructor() {
        // 阿里云盘文件映射
        this.fileMap = {
            'python-dev': {
                url: 'https://www.alipan.com/s/CEP5vojLAov',
                name: 'Python开发环境安装包',
                description: 'Python安装包、开发工具、注册工具打包'
            }
        };
    }

    async downloadTool(toolId) {
        const fileInfo = this.fileMap[toolId];
        if (!fileInfo) {
            throw new Error('工具不存在');
        }

        // 打开阿里云盘链接
        window.open(fileInfo.url, '_blank');

        // 记录下载统计
        this.logDownload(toolId);
    }

    async logDownload(toolId) {
        // 这里可以添加下载统计逻辑
        console.log(`Tool ${toolId} downloaded at ${new Date().toISOString()}`);
    }
}

// 导出实例
export const downloadManager = new DownloadManager();
