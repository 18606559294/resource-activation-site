/**
 * Trae.ai 品牌样式应用模块
 * 自动为所有包含 "Trae" 或 "Trae.ai" 的文本应用品牌渐变色
 */

class BrandStyling {
    constructor() {
        this.brandPattern = /Trae\.ai|Trae/gi;
        this.init();
    }

    init() {
        // DOM 加载完成后执行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyBrandStyling());
        } else {
            this.applyBrandStyling();
        }
    }

    applyBrandStyling() {
        // 应用到所有文本节点
        this.processTextNodes(document.body);
        
        // 为卡片添加动画效果
        this.addCardAnimations();
        
        // 添加滚动动画
        this.setupScrollAnimations();
    }

    processTextNodes(element) {
        // 跳过脚本和样式标签
        if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
            return;
        }

        // 处理文本节点
        if (element.nodeType === Node.TEXT_NODE) {
            const text = element.textContent;
            if (this.brandPattern.test(text)) {
                const span = document.createElement('span');
                span.className = 'trae-brand';
                span.innerHTML = text.replace(this.brandPattern, (match) => {
                    return `<span class="trae-brand">${match}</span>`;
                });
                element.parentNode.replaceChild(span, element);
            }
        } else {
            // 递归处理子节点
            Array.from(element.childNodes).forEach(child => {
                this.processTextNodes(child);
            });
        }
    }

    addCardAnimations() {
        // 为所有卡片添加悬停效果
        const cards = document.querySelectorAll('.category-card, .tool-item, .feature-card');
        cards.forEach((card, index) => {
            card.classList.add('hover-lift', 'animate-slide-up', `stagger-delay-${(index % 6) + 1}`);
        });

        // 为按钮添加效果
        const buttons = document.querySelectorAll('.btn, .cta-button');
        buttons.forEach(button => {
            button.classList.add('hover-gradient-shift');
        });
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // 观察所有需要滚动动画的元素
        const animatedElements = document.querySelectorAll('.category-card, .tool-item, section');
        animatedElements.forEach(el => {
            el.classList.add('scroll-reveal');
            observer.observe(el);
        });
    }
}

// 创建实例并导出
const brandStyling = new BrandStyling();
export default brandStyling;
