/**
 * 纯前端下载管理器
 * 替代原有的后端下载API，使用云存储链接直接下载
 */

class FrontendDownloadManager {
    constructor() {
        // 加载云存储配置
        this.loadCloudStorageConfig();
        
        // 下载队列
        /** @type {Map<string, {progress: number, status: string}>} */
        this.downloadQueue = new Map();
        
        // 下载历史记录
        this.downloadHistory = this.loadDownloadHistory();
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
     * 加载下载历史记录
     * @returns {Array} 下载历史记录
     */
    loadDownloadHistory() {
        try {
            const history = localStorage.getItem('download_history');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('加载下载历史记录失败:', error);
            return [];
        }
    }

    /**
     * 保存下载历史记录
     */
    saveDownloadHistory() {
        try {
            localStorage.setItem('download_history', JSON.stringify(this.downloadHistory));
        } catch (error) {
            console.error('保存下载历史记录失败:', error);
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
                .filter(([, storage]) => storage.tools && storage.tools[toolId]);

            if (availableStorages.length === 0) {
                alert('没有可用的下载链接');
                resolve(null);
                return;
            }

            // 如果只有一个存储选项，直接使用
            if (availableStorages.length === 1) {
                const [storageId, storage] = availableStorages[0];
                resolve({
                    storage: storageId,
                    url: storage.tools[toolId].url,
                    extractCode: storage.tools[toolId].extractCode
                });
                return;
            }

            // 创建对话框
            const dialog = document.createElement('div');
            dialog.className = 'cloud-storage-dialog';
            dialog.innerHTML = `
                <div class="dialog-content">
                    <h3>选择下载源</h3>
                    <div class="storage-list"></div>
                    <div class="dialog-buttons">
                        <button class="cancel-btn">取消</button>
                    </div>
                </div>
            `;

            // 添加存储选项
            const storageList = dialog.querySelector('.storage-list');
            availableStorages.forEach(([storageId, storage]) => {
                const storageItem = document.createElement('div');
                storageItem.className = 'storage-item';
                storageItem.innerHTML = `
                    <div class="storage-name">${storage.name}</div>
                    <button class="select-btn">选择</button>
                `;

                storageItem.querySelector('.select-btn').addEventListener('click', () => {
                    document.body.removeChild(dialog);
                    resolve({
                        storage: storageId,
                        url: storage.tools[toolId].url,
                        extractCode: storage.tools[toolId].extractCode
                    });
                });

                storageList.appendChild(storageItem);
            });

            // 取消按钮
            dialog.querySelector('.cancel-btn').addEventListener('click', () => {
                document.body.removeChild(dialog);
                resolve(null);
            });

            document.body.appendChild(dialog);
        });
    }

    /**
     * 下载工具
     * @param {string} toolId 工具ID
     */
    async downloadTool(toolId) {
        try {
            // 显示网盘选择对话框
            const storageInfo = await this.showCloudStorageDialog(toolId);
            if (!storageInfo) return;

            // 记录下载历史
            const downloadInfo = {
                id: `${toolId}-${Date.now()}`,
                toolId,
                storage: storageInfo.storage,
                url: storageInfo.url,
                timestamp: Date.now()
            };
            
            this.downloadHistory.unshift(downloadInfo);
            if (this.downloadHistory.length > 50) {
                this.downloadHistory.pop();
            }
            this.saveDownloadHistory();

            // 打开下载链接
            window.open(storageInfo.url, '_blank');
            
            // 如果有提取码，显示提取码
            if (storageInfo.extractCode) {
                this.showExtractCode(storageInfo.extractCode);
            }

            // 记录下载事件（可用于分析）
            this.logDownloadEvent(toolId, storageInfo.storage);

            return downloadInfo;
        } catch (error) {
            console.error('下载工具失败:', error);
            alert('下载失败，请稍后重试');
            return null;
        }
    }

    /**
     * 显示提取码
     * @param {string} extractCode 提取码
     */
    showExtractCode(extractCode) {
        const notification = document.createElement('div');
        notification.className = 'extract-code-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>网盘提取码</h4>
                <div class="extract-code">${extractCode}</div>
                <p>提取码已复制到剪贴板</p>
                <button class="close-btn">关闭</button>
            </div>
        `;

        // 复制提取码到剪贴板
        navigator.clipboard.writeText(extractCode).catch(err => {
            console.error('复制提取码失败:', err);
        });

        // 关闭按钮
        notification.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(notification);
        });

        // 自动关闭
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 10000);

        document.body.appendChild(notification);
    }

    /**
     * 记录下载事件
     * @param {string} toolId 工具ID
     * @param {string} storage 存储类型
     */
    logDownloadEvent(toolId, storage) {
        // 使用前端分析工具记录事件，如Google Analytics
        if (window.gtag) {
            window.gtag('event', 'download', {
                'event_category': 'tools',
                'event_label': toolId,
                'storage': storage
            });
        }
    }

    /**
     * 获取下载历史
     * @returns {Array} 下载历史
     */
    getDownloadHistory() {
        return this.downloadHistory;
    }

    /**
     * 清除下载历史
     */
    clearDownloadHistory() {
        this.downloadHistory = [];
        this.saveDownloadHistory();
    }
}

// 导出单例实例
export const frontendDownloadManager = new FrontendDownloadManager();