// 类型定义
/**
 * @typedef {Object} FileInfo
 * @property {string} url
 * @property {string} name
 * @property {string} description
 * @property {string} [extractCode]
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
        // 加载云存储配置
        this.loadCloudStorageConfig();
        
        // 下载队列
        /** @type {Map<string, {progress: number, status: string}>} */
        this.downloadQueue = new Map();
    }

    /**
     * 加载云存储配置
     */
    async loadCloudStorageConfig() {
        try {
            const response = await fetch('/src/config/cloud-storage.json');
            this.cloudStorage = await response.json();
        } catch (error) {
            console.error('加载云存储配置失败:', error);
            this.cloudStorage = { storages: {} };
        }
    }

    /**
     * 显示网盘选择对话框
     * @param {string} toolId 工具ID
     * @returns {Promise<{storage: string, url: string, extractCode?: string}>}
     */
    showCloudStorageDialog(toolId) {
        return new Promise((resolve) => {
            const storages = this.cloudStorage.storages;
            const availableStorages = Object.entries(storages)
                .filter(([, storage]) => storage.tools[toolId]);

            const dialog = document.createElement('div');
            dialog.className = 'cloud-storage-dialog';
            dialog.innerHTML = `
                <div class="dialog-content">
                    <h3>请选择下载方式</h3>
                    <div class="storage-list">
                        ${availableStorages.map(([key, storage]) => `
                            <button class="storage-option" data-storage="${key}">
                                <span class="storage-name">${storage.name}</span>
                                ${storage.tools[toolId].extractCode ? 
                                    `<span class="extract-code">提取码: ${storage.tools[toolId].extractCode}</span>` : 
                                    ''}
                            </button>
                        `).join('')}
                    </div>
                    <button class="dialog-close">关闭</button>
                </div>
            `;

            document.body.appendChild(dialog);

            // 添加样式
            const style = document.createElement('style');
            style.textContent = `
                .cloud-storage-dialog {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                }
                .dialog-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    min-width: 300px;
                }
                .storage-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin: 20px 0;
                }
                .storage-option {
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: #f5f5f5;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .storage-option:hover {
                    background: #e5e5e5;
                }
                .extract-code {
                    color: #666;
                    font-size: 0.9em;
                }
                .dialog-close {
                    width: 100%;
                    padding: 10px;
                    background: #f44336;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .dialog-close:hover {
                    background: #d32f2f;
                }
            `;
            document.head.appendChild(style);

            // 事件处理
            dialog.addEventListener('click', (e) => {
                const storageButton = e.target.closest('.storage-option');
                if (storageButton) {
                    const storageKey = storageButton.dataset.storage;
                    const storage = storages[storageKey];
                    const tool = storage.tools[toolId];
                    dialog.remove();
                    style.remove();
                    resolve({
                        storage: storageKey,
                        url: tool.url,
                        extractCode: tool.extractCode
                    });
                }
            });

            dialog.querySelector('.dialog-close').addEventListener('click', () => {
                dialog.remove();
                style.remove();
                resolve(null);
            });
        });
    }

    /**
     * 下载工具
     * @param {string} toolId 工具ID
     */
    async downloadTool(toolId) {
        try {
            // 显示网盘选择对话框
            const selection = await this.showCloudStorageDialog(toolId);
            if (!selection) return;

            // 如果有提取码，显示提示
            if (selection.extractCode) {
                this.showExtractCodeNotification(selection.extractCode);
            }

            // 打开下载链接
            window.open(selection.url, '_blank');

            // 记录下载
            this.logDownload(toolId, selection.storage);

        } catch (error) {
            console.error('下载失败:', error);
            this.showErrorNotification('下载失败，请稍后重试');
        }
    }

    /**
     * 显示提取码通知
     * @param {string} code 提取码
     */
    showExtractCodeNotification(code) {
        const notification = document.createElement('div');
        notification.className = 'extract-code-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <p>提取码已复制到剪贴板：${code}</p>
            </div>
        `;
        document.body.appendChild(notification);

        // 复制提取码到剪贴板
        navigator.clipboard.writeText(code).catch(console.error);

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .extract-code-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px 20px;
                border-radius: 4px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);

        // 5秒后移除通知
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 5000);
    }

    /**
     * 显示错误通知
     * @param {string} message 错误信息
     */
    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(notification);

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .error-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f44336;
                color: white;
                padding: 15px 20px;
                border-radius: 4px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);

        // 5秒后移除通知
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 5000);
    }

    /**
     * 记录下载日志
     * @param {string} toolId 工具ID
     * @param {string} storage 存储类型
     */
    logDownload(toolId, storage) {
        try {
            const logData = {
                toolId,
                storage,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                platform: navigator.platform
            };

            // 仅在控制台记录下载信息，不再发送到后端API
            console.log('下载记录:', logData);
            
            // 可以选择将下载记录保存到localStorage
            const downloadHistory = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
            downloadHistory.push(logData);
            localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory.slice(-20))); // 只保留最近20条记录
            
        } catch (error) {
            console.error('下载记录失败:', error);
        }
    }
}

// 导出实例
export const downloadManager = new DownloadManager();
