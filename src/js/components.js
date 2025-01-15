// 加载状态管理
export function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading-container';
    loading.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loading);
    
    // 强制回流后添加 show 类，以触发动画
    loading.offsetHeight;
    loading.classList.add('show');
}

export function hideLoading() {
    const loading = document.querySelector('.loading-container');
    if (loading) {
        loading.classList.remove('show');
        setTimeout(() => {
            loading.remove();
        }, 300);
    }
}

// 通知函数
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 动画效果
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动关闭
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 组件管理器
class ComponentManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.initModals();
        this.initTooltips();
        this.initTags();
        this.initAccordions();
        this.initAlerts();
        this.initFileUpload();
        this.initRating();
        this.initPagination();
    }
    
    // 模态框
    initModals() {
        document.querySelectorAll('[data-modal-target]').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modal = document.querySelector(trigger.dataset.modalTarget);
                this.openModal(modal);
            });
        });
        
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => {
                const modal = close.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', e => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }
    
    openModal(modal) {
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    // 工具提示
    initTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip-content';
            tooltip.textContent = element.dataset.tooltip;
            element.appendChild(tooltip);
        });
    }
    
    // 标签
    initTags() {
        document.querySelectorAll('.tag').forEach(tag => {
            const closeBtn = tag.querySelector('.tag-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    tag.remove();
                });
            }
        });
    }
    
    // 折叠面板
    initAccordions() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const isActive = item.classList.contains('active');
                
                // 关闭其他面板
                if (item.dataset.single !== undefined) {
                    item.closest('.accordion')
                        .querySelectorAll('.accordion-item')
                        .forEach(i => i.classList.remove('active'));
                }
                
                item.classList.toggle('active', !isActive);
            });
        });
    }
    
    // 警告框
    initAlerts() {
        document.querySelectorAll('.alert').forEach(alert => {
            const closeBtn = alert.querySelector('.alert-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    alert.style.height = alert.offsetHeight + 'px';
                    alert.style.opacity = '1';
                    
                    requestAnimationFrame(() => {
                        alert.style.height = '0';
                        alert.style.opacity = '0';
                        alert.style.margin = '0';
                        alert.style.padding = '0';
                    });
                    
                    alert.addEventListener('transitionend', () => {
                        alert.remove();
                    }, { once: true });
                });
            }
        });
    }
    
    // 文件上传
    initFileUpload() {
        document.querySelectorAll('.file-upload').forEach(upload => {
            const input = upload.querySelector('input[type="file"]');
            
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                upload.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            ['dragenter', 'dragover'].forEach(eventName => {
                upload.addEventListener(eventName, () => {
                    upload.classList.add('dragover');
                });
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                upload.addEventListener(eventName, () => {
                    upload.classList.remove('dragover');
                });
            });
            
            upload.addEventListener('drop', e => {
                const files = e.dataTransfer.files;
                if (input) {
                    input.files = files;
                    input.dispatchEvent(new Event('change'));
                }
            });
        });
    }
    
    // 评分
    initRating() {
        document.querySelectorAll('.rating').forEach(rating => {
            const stars = rating.querySelectorAll('.rating-star');
            const input = rating.querySelector('input[type="hidden"]');
            
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    const value = index + 1;
                    stars.forEach((s, i) => {
                        s.classList.toggle('active', i < value);
                    });
                    if (input) {
                        input.value = value;
                        input.dispatchEvent(new Event('change'));
                    }
                });
            });
        });
    }
    
    // 分页
    initPagination() {
        document.querySelectorAll('.pagination').forEach(pagination => {
            const items = pagination.querySelectorAll('.page-item');
            items.forEach(item => {
                item.addEventListener('click', () => {
                    if (!item.classList.contains('disabled')) {
                        items.forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                    }
                });
            });
        });
    }
}

// 初始化组件
document.addEventListener('DOMContentLoaded', () => {
    window.componentManager = new ComponentManager();
});
