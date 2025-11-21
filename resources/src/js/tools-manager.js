// 工具管理器
import { frontendDownloadManager } from './modules/frontend-download-manager.js';

/** @typedef {Object} Tool
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} version
 * @property {string} size
 * @property {boolean} [hasUpdate]
 * @property {string} [latestVersion]
 */

class ToolsManager {
    /** @type {HTMLElement | null} */
    toolsContainer;
    /** @type {Tool[]} */
    tools;
    /** @type {ReturnType<typeof setTimeout> | null} */
    updateInterval;

    constructor() {
        this.toolsContainer = document.getElementById('tools-container');
        this.tools = [];
        this.updateInterval = null;
        this.init();
    }

    async init() {
        try {
            // 只从本地配置加载工具信息，不再依赖后端API
            const toolsResponse = await fetch('/config/tools.json');
            
            if (!toolsResponse.ok) {
                throw new Error(`HTTP error! status: ${toolsResponse.status}`);
            }
            
            const toolsData = await toolsResponse.json();
            
            // 使用本地版本信息
            this.tools = toolsData.tools.map(tool => ({
                ...tool,
                hasUpdate: false, // 不再检查更新
                latestVersion: tool.version
            }));
            
            this.renderTools();
            this.setupUpdateChecker();
        } catch (error) {
            console.error('加载工具列表失败:', error);
            this.showError('加载工具列表失败，请刷新页面重试');
        }
    }

    setupUpdateChecker() {
        // 每6小时检查一次本地配置文件
        this.updateInterval = setInterval(async () => {
            try {
                const response = await fetch('/config/tools.json');
                if (!response.ok) return;
                
                const toolsData = await response.json();
                // 只更新工具信息，不检查版本更新
                this.tools = toolsData.tools.map(newTool => {
                    const existingTool = this.tools.find(t => t.id === newTool.id);
                    return {
                        ...newTool,
                        hasUpdate: false,
                        latestVersion: newTool.version
                    };
                });
                
                this.renderTools();
            } catch (error) {
                console.error('更新工具信息失败:', error);
            }
        }, 6 * 60 * 60 * 1000);
    }

    renderTools() {
        if (!this.toolsContainer) {
            console.error('找不到工具容器元素');
            return;
        }
        
        this.toolsContainer.innerHTML = this.tools.map((/** @type {Tool} */ tool, index) => `
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

    /**
     * 下载工具
     * @param {string} toolId 工具ID
     */
    async downloadTool(toolId) {
        try {
            await frontendDownloadManager.downloadTool(toolId);
        } catch (/** @type {any} */ error) {
            this.showError('下载失败：' + error.message);
        }
    }

    /**
     * 显示错误信息
     * @param {string} message 错误信息
     */
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
    /** @type {Window & { toolsManager?: ToolsManager }} */
    const win = window;
    win.toolsManager = new ToolsManager();
});
