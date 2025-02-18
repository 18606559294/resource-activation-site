    // ...此处为省略代码...
        this.isConnecting = true;
        const wsUrl = WS_CONFIG[process.env.NODE_ENV || 'development'];
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket连接已建立');
    // ...此处为省略代码...const WS_CONFIG = {
    development: 'ws://localhost:8765',
    production: 'wss://your-domain.com/ws'
};

class RealtimeUpdates {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000; // 3秒
        this.isConnecting = false;
        this.connect();
    }

    connect() {
        if (this.isConnecting) return;
        
        this.isConnecting = true;
        const wsUrl = WS_CONFIG[process.env.NODE_ENV || 'development'];
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket连接已建立');
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleUpdate(data);
        };

        this.ws.onclose = () => {
            console.log('WebSocket连接已关闭');
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
        };
    }

    attemptReconnect() {
        if (this.isConnecting) return;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`尝试重新连接... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            // 使用指数退避算法
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            setTimeout(() => {
                this.isConnecting = false;
                this.connect();
            }, delay);
        } else {
            console.error('达到最大重连次数，请刷新页面重试');
            // 显示重连失败提示
            this.showReconnectFailedNotification();
        }
    }

    showReconnectFailedNotification() {
        const notification = document.createElement('div');
        notification.className = 'websocket-error-notification';
        notification.innerHTML = `
            <p>连接服务器失败</p>
            <button onclick="window.location.reload()">刷新页面</button>
        `;
        document.body.appendChild(notification);
    }

    handleUpdate(data) {
        if (data.type === 'update') {
            // 显示更新通知
            this.showUpdateNotification(data);

            // 根据更新的文件类型刷新相应内容
            if (this.shouldRefreshPage(data.files)) {
                this.refreshPage();
            } else {
                this.refreshContent(data.files);
            }
        }
    }

    shouldRefreshPage(files) {
        // 检查是否需要刷新整个页面
        const criticalFiles = ['index.html', 'styles.css', 'i18n.js'];
        return files.some(file => criticalFiles.includes(file));
    }

    refreshPage() {
        // 显示刷新提示
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <p>网站内容已更新，3秒后将自动刷新页面...</p>
            <button onclick="window.location.reload()">立即刷新</button>
        `;
        document.body.appendChild(notification);

        // 3秒后自动刷新
        setTimeout(() => window.location.reload(), 3000);
    }

    refreshContent(files) {
        // 根据更新的文件类型刷新特定内容
        files.forEach(file => {
            if (file.endsWith('.json')) {
                // 刷新数据内容
                this.fetchAndUpdateData(file);
            }
        });
    }

    async fetchAndUpdateData(file) {
        try {
            const response = await fetch(file);
            const data = await response.json();
            // 更新相应的页面内容
            this.updatePageContent(data);
        } catch (error) {
            console.error('获取更新数据失败:', error);
        }
    }

    updatePageContent(data) {
        // 根据数据类型更新不同的页面部分
        // 这里需要根据具体的数据结构和页面布局来实现
    }

    showUpdateNotification(data) {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <p>仓库已更新: ${data.commit_message}</p>
            <small>更新文件: ${data.files.join(', ')}</small>
        `;
        document.body.appendChild(notification);

        // 5秒后自动移除通知
        setTimeout(() => notification.remove(), 5000);
    }
}

// 页面加载完成后初始化WebSocket连接
document.addEventListener('DOMContentLoaded', () => {
    window.realtimeUpdates = new RealtimeUpdates();
});
