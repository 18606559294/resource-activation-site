// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
    initializeDownloadButtons();
});

// 初始化动画
function initializeAnimations() {
    // 使用 Intersection Observer 监听元素进入视口
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // 动画只触发一次
            }
        });
    }, {
        threshold: 0.1 // 当元素10%进入视口时触发
    });

    // 监听所有需要动画的元素
    document.querySelectorAll('.animate-float-up, .feature-card, .stat-item').forEach(el => {
        observer.observe(el);
    });
}

// 初始化下载按钮
function initializeDownloadButtons() {
    document.querySelectorAll('a[download]').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                const response = await fetch(button.href);
                if (!response.ok) throw new Error('Download failed');
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = button.href.split('/').pop();
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                showToast('下载开始，请稍候...');
            } catch (error) {
                console.error('Download error:', error);
                showToast('下载失败，请稍后重试', 'error');
            }
        });
    });
}

// 显示提示信息
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // 添加显示类以触发动画
    setTimeout(() => toast.classList.add('show'), 100);

    // 3秒后移除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
