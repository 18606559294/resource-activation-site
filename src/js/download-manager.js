// 类型定义
/**
 * @typedef {Object} FileInfo
 * @property {string} url
 * @property {string} name
 * @property {string} description
 */

/**
 * @typedef {Object} TokenResponse
 * @property {boolean} success
 * @property {string} [token]
 * @property {number} [expires]
 * @property {string} [message]
 */

class DownloadManager {
    constructor() {
        // API端点
        this.apiUrl = '/api/download.php';
        // 阿里云盘文件映射（备用）
        /** @type {{[key: string]: FileInfo}} */
        this.fileMap = {
            'python-dev': {
                url: 'https://www.alipan.com/s/CEP5vojLAov',
                name: 'Python开发环境安装包',
                description: 'Python安装包、开发工具、注册工具打包'
            }
        };
    }

    /**
     * 下载工具
     * @param {string} toolId 工具ID
     */
    async downloadTool(toolId) {
        try {
            // 1. 请求下载令牌
            const tokenResponse = await this.requestDownloadToken(toolId);
            if (!tokenResponse.success) {
                throw new Error(tokenResponse.message);
            }

            // 2. 使用令牌获取下载链接
            const downloadUrl = `${this.apiUrl}?token=${tokenResponse.token}&tool_id=${toolId}`;

            // 3. 创建隐藏的iframe进行下载
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = downloadUrl;
            document.body.appendChild(iframe);

            // 4. 记录下载统计
            this.logDownload(toolId);

            // 5. 清理iframe
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 10000);

        } catch (error) {
            console.error('下载失败:', error);
            // 如果API下载失败，尝试备用方案
            this.fallbackToCloudDownload(toolId);
        }
    }

    /**
     * 请求下载令牌
     * @param {string} toolId 工具ID
     * @returns {Promise<TokenResponse>}
     */
    async requestDownloadToken(toolId) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'request_download',
                tool_id: toolId
            })
        });
        return response.json();
    }

    /**
     * 备用下载方案
     * @param {string} toolId 工具ID
     */
    fallbackToCloudDownload(toolId) {
        const fileInfo = this.fileMap[toolId];
        if (fileInfo) {
            window.open(fileInfo.url, '_blank');
            this.logDownload(toolId);
        } else {
            throw new Error('无法下载该工具');
        }
    }

    /**
     * 记录下载日志
     * @param {string} toolId 工具ID
     */
    async logDownload(toolId) {
        // 这里可以添加下载统计逻辑
        console.log(`Tool ${toolId} downloaded at ${new Date().toISOString()}`);
    }
}

// 导出实例
export const downloadManager = new DownloadManager();
