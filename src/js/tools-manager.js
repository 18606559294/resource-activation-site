// 工具管理器
import { downloadManager } from './download-manager.js';

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
            // 检查工具更新
            const [toolsResponse, versionResponse] = await Promise.all([
                fetch('/config/tools.json'),
                fetch('/api/tools/versions')
            ]);
            
            if (!toolsResponse.ok || !versionResponse.ok) {
                throw new Error(`HTTP error! status: ${toolsResponse.status}, ${versionResponse.status}`);
            }
            
            const [toolsData, versions] = await Promise.all([
                toolsResponse.json(),
                versionResponse.json()
            ]);
            
            // 合并版本信息
            this.tools = toolsData.tools.map(tool => ({
                ...tool,
                hasUpdate: versions[tool.id] && versions[tool.id] > tool.version,
                latestVersion: versions[tool.id] || tool.version
            }));
            
            this.renderTools();
            this.setupUpdateChecker();
        } catch (error) {
            console.error('加载工具列表失败:', error);
            this.showError('加载工具列表失败，请刷新页面重试');
        }
    }

    setupUpdateChecker() {
        // 每6小时检查一次更新
        this.updateInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/tools/versions');
                if (!response.ok) return;
                
                const versions = await response.json();
                this.tools = this.tools.map(tool => ({
                    ...tool,
                    hasUpdate: versions[tool.id] && versions[tool.id] > tool.version,
                    latestVersion: versions[tool.id] || tool.version
                }));
                
                this.renderTools();
            } catch (error) {
                console.error('检查更新失败:', error);
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
            await downloadManager.downloadTool(toolId);
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
