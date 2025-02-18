// 导入样式和依赖
import '../css/status.css';
import '../css/components.css';
import '../css/ui-feedback.css';
import '../css/status-indicator.css';
import { showErrorMessage, showLoadingIndicator, hideLoadingIndicator } from './components/ui-feedback.js';
import './animations.js';
import '../i18n.js';

// 状态更新间隔（毫秒）
const UPDATE_INTERVAL = 5000;

// 初始化状态页面
async function initStatusPage() {
    try {
        // 显示加载状态
        showLoadingIndicator('正在加载系统状态...');

        // 初始化状态卡片
        initializeStatusCards();

        // 开始定期更新状态
        startStatusUpdates();

        // 隐藏加载状态
        hideLoadingIndicator();
    } catch (error) {
        console.error('状态页面初始化失败:', error);
        showErrorMessage({
            title: '加载失败',
            message: '无法加载系统状态信息，请稍后重试。',
            actionText: '重试',
            actionHandler: () => window.location.reload()
        });
    }
}

// 初始化状态卡片
function initializeStatusCards() {
    // 设置初始状态
    updateUptime('--:--:--');
    updateLoad('--');

    // 添加状态卡片的交互效果
    document.querySelectorAll('.status-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.add('active');
            setTimeout(() => card.classList.remove('active'), 200);
        });
    });
}

// 开始定期更新状态
function startStatusUpdates() {
    // 立即执行一次更新
    updateStatus();
    
    // 设置定期更新
    setInterval(updateStatus, UPDATE_INTERVAL);
}

// 更新状态信息
async function updateStatus() {
    try {
        // 获取服务器状态数据
        const statusData = await fetchStatusData();
        
        // 更新UI显示
        updateUptime(statusData.uptime);
        updateLoad(statusData.load);

        // 更新状态指示器
        updateStatusIndicator(statusData.load);
    } catch (error) {
        console.error('状态更新失败:', error);
        showErrorMessage({
            title: '更新失败',
            message: '无法获取最新状态信息',
            actionText: '重试',
            actionHandler: updateStatus
        });
    }
}

// 更新运行时间显示
function updateUptime(value) {
    const element = document.getElementById('uptime');
    if (element) element.textContent = value;
}

// 更新负载显示
function updateLoad(value) {
    const element = document.getElementById('load');
    if (element) element.textContent = `${value}%`;
}

// 更新状态指示器
function updateStatusIndicator(load) {
    const indicator = document.querySelector('.status-indicator');
    if (indicator) {
        // 移除所有可能的状态类
        indicator.classList.remove('status-online', 'status-warning', 'status-offline', 'status-error');
        
        // 根据负载值设置对应的状态类
        if (load < 50) {
            indicator.classList.add('status-online');
        } else if (load < 80) {
            indicator.classList.add('status-warning');
        } else {
            indicator.classList.add('status-offline');
        }
        
        // 设置状态提示
        indicator.title = `服务器负载: ${load}%`;
    }
}

// 获取实际状态数据
async function fetchStatusData() {
    try {
        // 由于API可能还未实现，先使用模拟数据
        const mockData = {
            uptime: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400),
            load: Math.floor(Math.random() * 100)
        };
        
        return {
            uptime: formatUptime(mockData.uptime),
            load: mockData.load
        };
    } catch (error) {
        console.error('获取状态数据失败:', error);
        // 返回默认值
        return {
            uptime: formatUptime(Math.floor(Date.now() / 1000)),
            load: 0
        };
    }
}

// 格式化运行时间
function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
}

// 数字补零
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// 当DOM加载完成时初始化页面
document.addEventListener('DOMContentLoaded', initStatusPage);
