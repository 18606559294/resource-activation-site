// 动画效果模块
export class AnimationManager {
    constructor() {
        this.observers = new Map();
        this.initIntersectionObserver();
    }

    initIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, options);
    }

    animateElement(element) {
        const animation = element.dataset.animation || 'fadeIn';
        element.classList.add('animated', animation);
        
        // 动画完成后移除观察
        element.addEventListener('animationend', () => {
            this.observer.unobserve(element);
        }, { once: true });
    }

    observe(element) {
        if (element) {
            this.observer.observe(element);
        }
    }

    observeAll() {
        document.querySelectorAll('[data-animation]').forEach(element => {
            this.observe(element);
        });
    }
}

export const animationManager = new AnimationManager();
export default animationManager;
