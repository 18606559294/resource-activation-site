// 动画管理器
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        // 监听滚动事件
        window.addEventListener('scroll', () => {
            this.handleScroll();
            this.animateOnScroll();
        });

        // 初始化导航栏效果
        this.initNavbar();

        // 初始化入场动画
        this.initEntryAnimations();
    }

    handleScroll() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    animateOnScroll() {
        const elements = document.querySelectorAll('.feature-card, .tool-card');
        elements.forEach(element => {
            if (this.isElementInViewport(element) && !element.classList.contains('animated')) {
                element.classList.add('animate-fadeInUp', 'animated');
            }
        });
    }

    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    initNavbar() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                const width = e.target.offsetWidth;
                const height = e.target.offsetHeight;
                const x = e.target.offsetLeft;
                const y = e.target.offsetTop;
                
                // 创建涟漪效果
                const ripple = document.createElement('span');
                ripple.classList.add('nav-ripple');
                ripple.style.width = ripple.style.height = Math.max(width, height) + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                link.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 1000);
            });
        });
    }

    initEntryAnimations() {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.classList.add('animate-fadeInUp');
        }

        // 为特性卡片添加延迟动画
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.2}s`;
        });
    }
}

// 初始化动画
const animationManager = new AnimationManager();
