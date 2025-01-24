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

const API_CONFIG = {
    development: '/api/download.php',
    production: 'https://api.your-domain.com/download'
};

class DownloadManager {
    constructor() {
        // API端点
        this.apiUrl = API_CONFIG[process.env.NODE_ENV || 'development'];
        
        // 阿里云盘文件映射（备用）
        /** @type {{[key: string]: FileInfo}} */
        this.fileMap = {
            'python-dev': {
                url: 'https://www.alipan.com/s/CEP5vojLAov',
                name: 'Python开发环境安装包',
                description: 'Python安装包、开发工具、注册工具打包'
            }
        };

        // 下载队列
        /** @type {Map<string, {progress: number, status: string}>} */
        this.downloadQueue = new Map();
    }

    /**
     * 下载工具
     * @param {string} toolId 工具ID
     */
    async downloadTool(toolId) {
        try {
            // 更新下载状态
            this.downloadQueue.set(toolId, { progress: 0, status: 'starting' });
            this.updateDownloadProgress(toolId, 0);

            // 1. 请求下载令牌
            const tokenResponse = await this.requestDownloadToken(toolId);
            if (!tokenResponse.success) {
                throw new Error(tokenResponse.message);
            }

            // 2. 使用令牌获取下载链接
            const downloadUrl = `${this.apiUrl}?token=${tokenResponse.token}&tool_id=${toolId}`;

            // 3. 使用 fetch 下载文件
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error('Download failed');

            const contentLength = response.headers.get('content-length');
            const total = parseInt(contentLength, 10);
            let loaded = 0;

            // 4. 创建可读流
            const reader = response.body.getReader();
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                loaded += value.length;
                
                // 更新进度
                const progress = Math.round((loaded / total) * 100);
                this.updateDownloadProgress(toolId, progress);
            }

            // 5. 合并数据块并创建 Blob
            const blob = new Blob(chunks);
            const url = window.URL.createObjectURL(blob);

            // 6. 创建下载链接
            const a = document.createElement('a');
            a.href = url;
            a.download = this.getFileName(toolId, response.headers.get('content-type'));
            document.body.appendChild(a);
            a.click();

            // 7. 清理
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // 8. 记录下载统计
            await this.logDownload(toolId);

            // 9. 更新状态为完成
            this.downloadQueue.set(toolId, { progress: 100, status: 'completed' });
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
     * 更新下载进度
     * @param {string} toolId 工具ID
     * @param {number} progress 进度百分比
     */
    updateDownloadProgress(toolId, progress) {
        // 更新队列状态
        const download = this.downloadQueue.get(toolId);
        if (download) {
            download.progress = progress;
            download.status = progress < 100 ? 'downloading' : 'completed';
        }

        // 触发进度更新事件
        const event = new CustomEvent('downloadProgress', {
            detail: { toolId, progress }
        });
        document.dispatchEvent(event);

        // 更新UI进度条
        this.updateProgressUI(toolId, progress);
    }

    /**
     * 更新进度条UI
     * @param {string} toolId 工具ID
     * @param {number} progress 进度百分比
     */
    updateProgressUI(toolId, progress) {
        const progressBar = document.querySelector(`#download-progress-${toolId}`);
        if (!progressBar) {
            const container = document.createElement('div');
            container.className = 'download-progress-container';
            container.innerHTML = `
                <div class="download-progress" id="download-progress-${toolId}">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                    <div class="progress-text">${progress}%</div>
                </div>
            `;
            document.body.appendChild(container);
        } else {
            const bar = progressBar.querySelector('.progress-bar');
            const text = progressBar.querySelector('.progress-text');
            if (bar) bar.style.width = `${progress}%`;
            if (text) text.textContent = `${progress}%`;
            
            if (progress === 100) {
                setTimeout(() => {
                    progressBar.parentElement?.remove();
                }, 2000);
            }
        }
    }

    /**
     * 获取文件名
     * @param {string} toolId 工具ID
     * @param {string} contentType MIME类型
     * @returns {string}
     */
    getFileName(toolId, contentType) {
        const fileInfo = this.fileMap[toolId];
        if (fileInfo && fileInfo.name) {
            return fileInfo.name;
        }
        const ext = this.getExtensionFromMime(contentType);
        return `${toolId}${ext}`;
    }

    /**
     * 从MIME类型获取文件扩展名
     * @param {string} mime MIME类型
     * @returns {string}
     */
    getExtensionFromMime(mime) {
        const mimeMap = {
            'application/x-msdownload': '.exe',
            'application/x-zip-compressed': '.zip',
            'application/zip': '.zip',
            'application/x-rar-compressed': '.rar'
        };
        return mimeMap[mime] || '';
    }

    /**
     * 记录下载日志
     * @param {string} toolId 工具ID
     */
    async logDownload(toolId) {
        try {
            const logData = {
                toolId,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                platform: navigator.platform
            };

            const response = await fetch(`${this.apiUrl}/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logData)
            });

            if (!response.ok) {
                throw new Error('Failed to log download');
            }
        } catch (error) {
            console.error('Download logging failed:', error);
        }
    }
}

// 导出实例
export const downloadManager = new DownloadManager();
