// 工具管理器
import { downloadManager } from './download-manager.js';

class ToolsManager {
    constructor() {
        this.toolsContainer = document.getElementById('tools-container');
        this.tools = [];
        this.init();
    }

    async init() {
        try {
            const response = await fetch('/config/tools.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.tools = data.tools;
            this.renderTools();
        } catch (error) {
            console.error('加载工具列表失败:', error);
            this.showError('加载工具列表失败，请刷新页面重试');
        }
    }

    renderTools() {
        if (!this.toolsContainer) {
            console.error('找不到工具容器元素');
            return;
        }
        
        this.toolsContainer.innerHTML = this.tools.map((tool, index) => `
            <div class="tool-card" style="animation-delay: ${index * 0.1}s">
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-description">${tool.description}</p>
                <div class="tool-meta">
                    <span>版本 ${tool.version}</span>
                    <span class="tool-size">${tool.size}</span>
                </div>
                <button class="download-button" onclick="toolsManager.downloadTool('${tool.id}')">
                    下载
                </button>
            </div>
        `).join('');
    }

    async downloadTool(toolId) {
        try {
            await downloadManager.downloadTool(toolId);
        } catch (error) {
            this.showError('下载失败：' + error.message);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }
}

// 初始化工具管理器
window.addEventListener('DOMContentLoaded', () => {
    window.toolsManager = new ToolsManager();
});
