// 导入样式
import '../css/styles.css';
import '../css/components.css';

// 导入功能模块
import '../i18n.js';

// 安全信息配置
const securityInfo = {
    privacy: {
        title: "security.privacy.modal.title",
        content: "security.privacy.modal.content"
    },
    password: {
        title: "security.password.modal.title",
        content: "security.password.modal.content"
    },
    phishing: {
        title: "security.phishing.modal.title",
        content: "security.phishing.modal.content"
    }
};

// 显示模态框
window.showModal = function(type) {
    const modal = document.querySelector('.modal');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');
    
    title.setAttribute('data-i18n', securityInfo[type].title);
    content.setAttribute('data-i18n', securityInfo[type].content);
    
    // 更新翻译
    updateContent();
    
    modal.style.display = 'flex';
};

// 关闭模态框
window.closeModal = function(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.querySelector('.modal');
    modal.style.display = 'none';
};

// 更新翻译
function updateContent() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        // 使用 i18n.js 中的翻译函数
        if (window.i18n && window.i18n.t) {
            element.textContent = window.i18n.t(key);
        }
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化翻译
    updateContent();
});
