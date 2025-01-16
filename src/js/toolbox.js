import axios from 'axios';
import { showNotification, showLoading, hideLoading } from './components.js';

const toolsInfo = {
    'win10': {
        name: 'toolbox.win10.title',
        version: '2.1.0',
        size: '2.5MB',
        updateTime: '2025-01-15',
        description: `
            <h3>功能特点：</h3>
            <ul>
                <li>支持所有 Windows 10 版本激活</li>
                <li>永久激活，无需定期更新</li>
                <li>自动识别系统版本</li>
                <li>支持命令行模式</li>
                <li>支持静默安装</li>
            </ul>
            <h3>使用说明：</h3>
            <ol>
                <li>以管理员身份运行工具</li>
                <li>选择要激活的系统版本</li>
                <li>点击"激活"按钮</li>
                <li>等待激活完成</li>
            </ol>
            <h3>注意事项：</h3>
            <ul>
                <li>使用前请关闭杀毒软件</li>
                <li>需要联网使用</li>
                <li>如遇问题请查看日志文件</li>
            </ul>
        `,
        downloadUrl: '/api/download/win10-activator'
    },
    'win11': {
        name: 'resources.win11.title',
        version: '1.5.2',
        size: '2.8MB',
        updateTime: '2025-01-10',
        description: `
            <h3>功能特点：</h3>
            <ul>
                <li>支持所有 Windows 11 版本激活</li>
                <li>支持数字许可证激活</li>
                <li>自动备份激活信息</li>
                <li>支持命令行模式</li>
                <li>支持静默安装</li>
            </ul>
            <h3>使用说明：</h3>
            <ol>
                <li>以管理员身份运行工具</li>
                <li>选择激活方式</li>
                <li>点击"开始激活"按钮</li>
                <li>等待激活完成</li>
            </ol>
            <h3>注意事项：</h3>
            <ul>
                <li>使用前请关闭杀毒软件</li>
                <li>需要联网使用</li>
                <li>如遇问题请查看日志文件</li>
            </ul>
        `,
        downloadUrl: '/api/download/win11-activator'
    },
    'office': {
        name: 'resources.office.title',
        version: '3.0.1',
        size: '3.2MB',
        updateTime: '2025-01-12',
        description: `
            <h3>功能特点：</h3>
            <ul>
                <li>支持 Office 2019-2024 所有版本</li>
                <li>支持批量激活</li>
                <li>自动识别安装版本</li>
                <li>支持命令行模式</li>
                <li>支持静默安装</li>
            </ul>
            <h3>使用说明：</h3>
            <ol>
                <li>以管理员身份运行工具</li>
                <li>选择 Office 版本</li>
                <li>点击"一键激活"按钮</li>
                <li>等待激活完成</li>
            </ol>
            <h3>注意事项：</h3>
            <ul>
                <li>使用前请关闭 Office 所有程序</li>
                <li>需要联网使用</li>
                <li>如遇问题请查看日志文件</li>
            </ul>
        `,
        downloadUrl: '/api/download/office-activator'
    }
};

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    initializeToolbox();
});

/**
 * 初始化工具箱
 */
function initializeToolbox() {
    // 添加下载按钮事件监听
    /** @type {NodeListOf<HTMLElement>} */
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(btn => {
        const toolId = /** @type {keyof typeof toolsInfo} */ (btn.dataset.tool);
        if (toolId && toolsInfo[toolId]) {
            btn.addEventListener('click', async () => {
                await downloadTool(toolId);
            });
        }
    });

    // 添加详情按钮事件监听
    /** @type {NodeListOf<HTMLElement>} */
    const infoButtons = document.querySelectorAll('.info-btn');
    infoButtons.forEach(btn => {
        const toolId = /** @type {keyof typeof toolsInfo} */ (btn.dataset.tool);
        if (toolId && toolsInfo[toolId]) {
            btn.addEventListener('click', () => {
                showToolInfo(toolId);
            });
        }
    });

    // 添加模态框关闭按钮事件监听
    const modal = document.getElementById('toolModal');
    if (modal) {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
}

/**
 * 显示工具信息
 * @param {keyof typeof toolsInfo} toolId 工具ID
 */
function showToolInfo(toolId) {
    const tool = toolsInfo[toolId];
    if (!tool) return;

    const modal = document.getElementById('toolModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.textContent = tool.name;
    modalBody.innerHTML = `
        <div class="tool-details">
            <p><strong>版本：</strong>${tool.version}</p>
            <p><strong>大小：</strong>${tool.size}</p>
            <p><strong>更新时间：</strong>${tool.updateTime}</p>
            ${tool.description}
        </div>
    `;

    modal.style.display = 'block';
}

/**
 * 下载工具
 * @param {keyof typeof toolsInfo} toolId 工具ID
 */
async function downloadTool(toolId) {
    const tool = toolsInfo[toolId];
    if (!tool) return;

    try {
        showLoading();
        showNotification('正在准备下载...', 'info');

        const response = await axios.get(tool.downloadUrl, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showNotification(`下载进度: ${percentCompleted}%`, 'info');
                }
            }
        });

        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${toolId}-activator.exe`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        showNotification('下载完成！', 'success');
    } catch (error) {
        console.error('下载失败:', error);
        showNotification('下载失败，请稍后重试', 'error');
    } finally {
        hideLoading();
    }
}
