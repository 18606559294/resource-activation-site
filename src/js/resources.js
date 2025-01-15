import axios from 'axios';
import { showNotification, showLoading, hideLoading } from './components.js';

const resourcesInfo = {
    'win10-pro': {
        name: 'Windows 10 专业版',
        version: '21H2',
        size: '4.8GB',
        updateTime: '2025-01-15',
        description: `
            <h3>系统要求：</h3>
            <ul>
                <li>处理器：1 GHz 或更快的处理器或 SoC</li>
                <li>内存：1 GB (32 位) 或 2 GB (64 位)</li>
                <li>硬盘空间：16 GB (32 位) 或 32 GB (64 位)</li>
                <li>显卡：DirectX 9 或更高版本，WDDM 1.0 驱动程序</li>
                <li>显示器：800x600 分辨率</li>
            </ul>
            <h3>版本特点：</h3>
            <ul>
                <li>支持最新的安全更新</li>
                <li>包含所有功能更新</li>
                <li>支持 Windows Hello 面部识别</li>
                <li>支持 BitLocker 设备加密</li>
                <li>支持远程桌面</li>
            </ul>
            <h3>下载说明：</h3>
            <p>本版本为官方原版系统，未经任何修改。下载后可使用 Windows 媒体创建工具制作启动盘进行安装。</p>
            <h3>安装步骤：</h3>
            <ol>
                <li>下载 Windows 10 ISO 文件</li>
                <li>下载并安装 Windows 媒体创建工具</li>
                <li>准备一个至少 8GB 的 U 盘</li>
                <li>使用媒体创建工具制作启动盘</li>
                <li>重启电脑，从 U 盘启动</li>
                <li>按照安装向导完成安装</li>
            </ol>
        `,
        downloadUrl: '/api/download/windows10-pro'
    },
    'win11-pro': {
        name: 'Windows 11 专业版',
        version: '23H2',
        size: '5.2GB',
        updateTime: '2025-01-10',
        description: `
            <h3>系统要求：</h3>
            <ul>
                <li>处理器：1 GHz 或更快，具有 2 个或更多核心的 64 位处理器</li>
                <li>内存：4 GB</li>
                <li>硬盘空间：64 GB</li>
                <li>系统固件：UEFI，支持安全启动</li>
                <li>TPM：可信平台模块 (TPM) 2.0</li>
                <li>显卡：DirectX 12 或更高版本，WDDM 2.0 驱动程序</li>
                <li>显示器：高清显示器 (720p)，对角线尺寸大于 9 英寸</li>
            </ul>
            <h3>版本特点：</h3>
            <ul>
                <li>全新的用户界面设计</li>
                <li>支持 Android 应用</li>
                <li>增强的触摸、笔和语音输入</li>
                <li>DirectStorage 游戏加载技术</li>
                <li>Windows Studio Effects</li>
            </ul>
            <h3>下载说明：</h3>
            <p>本版本为官方原版系统，未经任何修改。下载后可使用 Windows 11 安装助手进行安装。</p>
            <h3>安装步骤：</h3>
            <ol>
                <li>下载 Windows 11 ISO 文件</li>
                <li>下载并安装 Windows 11 安装助手</li>
                <li>运行安装助手并选择 ISO 文件</li>
                <li>选择安装方式（升级或全新安装）</li>
                <li>按照安装向导完成安装</li>
            </ol>
            <h3>注意事项：</h3>
            <ul>
                <li>安装前请检查系统兼容性</li>
                <li>建议备份重要数据</li>
                <li>确保电脑已连接电源</li>
            </ul>
        `,
        downloadUrl: '/api/download/windows11-pro'
    },
    'office2024': {
        name: 'Office 2024 专业增强版',
        version: '2024',
        size: '2.8GB',
        updateTime: '2025-01-12',
        description: `
            <h3>系统要求：</h3>
            <ul>
                <li>操作系统：Windows 10 或 Windows 11</li>
                <li>处理器：1.6 GHz 或更快的双核处理器</li>
                <li>内存：4 GB RAM</li>
                <li>硬盘空间：4 GB 可用空间</li>
                <li>显示器：1280 x 768 分辨率</li>
            </ul>
            <h3>包含组件：</h3>
            <ul>
                <li>Microsoft Word 2024</li>
                <li>Microsoft Excel 2024</li>
                <li>Microsoft PowerPoint 2024</li>
                <li>Microsoft Outlook 2024</li>
                <li>Microsoft Access 2024</li>
                <li>Microsoft Publisher 2024</li>
            </ul>
            <h3>新功能特点：</h3>
            <ul>
                <li>AI 驱动的智能助手</li>
                <li>实时协作功能</li>
                <li>增强的数据分析工具</li>
                <li>新的演示模板</li>
                <li>改进的安全性</li>
            </ul>
            <h3>安装步骤：</h3>
            <ol>
                <li>下载 Office 2024 安装包</li>
                <li>关闭所有 Office 应用程序</li>
                <li>运行安装程序</li>
                <li>选择需要安装的组件</li>
                <li>等待安装完成</li>
            </ol>
            <h3>注意事项：</h3>
            <ul>
                <li>安装前请卸载旧版本</li>
                <li>确保有足够的磁盘空间</li>
                <li>建议备份重要文档</li>
            </ul>
        `,
        downloadUrl: '/api/download/office2024'
    }
};

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    initializeResources();
});

// 初始化资源页面
function initializeResources() {
    // 添加下载按钮事件监听
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const resourceId = btn.dataset.resource;
            await downloadResource(resourceId);
        });
    });

    // 添加详情按钮事件监听
    document.querySelectorAll('.info-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const resourceId = btn.dataset.resource;
            showResourceInfo(resourceId);
        });
    });

    // 添加模态框关闭按钮事件监听
    const modal = document.getElementById('resourceModal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 显示资源信息
function showResourceInfo(resourceId) {
    const resource = resourcesInfo[resourceId];
    if (!resource) return;

    const modal = document.getElementById('resourceModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = resource.name;
    modalBody.innerHTML = `
        <div class="resource-details">
            <p><strong>版本：</strong>${resource.version}</p>
            <p><strong>大小：</strong>${resource.size}</p>
            <p><strong>更新时间：</strong>${resource.updateTime}</p>
            ${resource.description}
        </div>
    `;

    modal.style.display = 'block';
}

// 下载资源
async function downloadResource(resourceId) {
    const resource = resourcesInfo[resourceId];
    if (!resource) return;

    try {
        showLoading();
        showNotification('正在准备下载...', 'info');

        const response = await axios.get(resource.downloadUrl, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                showNotification(`下载进度: ${percentCompleted}%`, 'info');
            }
        });

        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${resourceId}.iso`);
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
