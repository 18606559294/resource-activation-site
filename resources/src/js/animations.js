// 滚动动画处理
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('stagger-animation')) {
                const children = entry.target.children;
                Array.from(children).forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('animate-float-up');
                    }, index * 100);
                });
            }
        }
    });
}, observerOptions);

// 观察所有需要滚动动画的元素
document.addEventListener('DOMContentLoaded', () => {
    const scrollElements = document.querySelectorAll('.scroll-reveal, .stagger-animation');
    scrollElements.forEach(el => observer.observe(el));
});

// 点击效果
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('click-effect')) {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        e.target.appendChild(ripple);
        
        const rect = e.target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }
});

// 3D 卡片效果
const cards = document.querySelectorAll('.card-3d');
cards.forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = -(x - centerX) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
});

// 加载动画
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    const loadingScreen = document.querySelector('.loading');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
});
