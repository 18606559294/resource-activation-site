class Particle {
    constructor(canvas, x, y, color) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.color = color;
        this.baseRadius = Math.random() * 2 + 1;
        this.radius = this.baseRadius;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = Math.random() * 100 + 100;
        this.initialLife = this.life;
        this.pulse = 0;
        this.pulseSpeed = Math.random() * 0.1 + 0.05;
    }

    update(mouseX, mouseY) {
        // 更新位置
        this.x += this.vx;
        this.y += this.vy;

        // 边界检查
        if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;

        // 鼠标交互
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            const angle = Math.atan2(dy, dx);
            const force = (100 - distance) / 100;
            this.vx -= Math.cos(angle) * force * 0.5;
            this.vy -= Math.sin(angle) * force * 0.5;
        }

        // 脉冲动画
        this.pulse += this.pulseSpeed;
        this.radius = this.baseRadius + Math.sin(this.pulse) * 0.5;

        // 生命周期
        this.life--;
        if (this.life <= 0) {
            this.life = this.initialLife;
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
        }
    }

    draw(ctx) {
        const opacity = this.life / this.initialLife;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
    }
}

class BackgroundAnimation {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.colors = [
            '#E6F3FF', // 淡蓝色
            '#FFF4E6', // 暖橙色
            '#F0F7F4', // 薄荷绿
            '#F5F5F5', // 浅灰白
            '#F4EBF5'  // 淡紫色
        ];
        this.currentColorIndex = 0;
        this.targetColorIndex = 0;
        this.colorTransition = 0;
        this.lastColorChange = Date.now();
        this.colorChangeDuration = 5000; // 5秒渐变
        
        this.init();
    }

    init() {
        // 设置画布
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        document.body.insertBefore(this.canvas, document.body.firstChild);

        // 响应窗口大小变化
        window.addEventListener('resize', () => this.resize());
        this.resize();

        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // 初始化粒子
        this.createParticles();

        // 开始动画
        this.animate();

        // 定时更新颜色
        setInterval(() => this.updateColor(), 10000);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 调整粒子数量
        const targetCount = Math.floor((this.canvas.width * this.canvas.height) / 10000);
        
        if (targetCount > this.particles.length) {
            while (this.particles.length < targetCount) {
                this.addParticle();
            }
        } else if (targetCount < this.particles.length) {
            this.particles.length = targetCount;
        }
    }

    createParticles() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 10000);
        for (let i = 0; i < particleCount; i++) {
            this.addParticle();
        }
    }

    addParticle() {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.particles.push(new Particle(this.canvas, x, y, color));
    }

    updateColor() {
        this.currentColorIndex = this.targetColorIndex;
        this.targetColorIndex = (this.targetColorIndex + 1) % this.colors.length;
        this.colorTransition = 0;
        this.lastColorChange = Date.now();
    }

    getBackgroundColor() {
        const progress = (Date.now() - this.lastColorChange) / this.colorChangeDuration;
        this.colorTransition = Math.min(1, progress);

        const currentColor = this.hexToRgb(this.colors[this.currentColorIndex]);
        const targetColor = this.hexToRgb(this.colors[this.targetColorIndex]);
        
        const r = Math.round(currentColor.r + (targetColor.r - currentColor.r) * this.colorTransition);
        const g = Math.round(currentColor.g + (targetColor.g - currentColor.g) * this.colorTransition);
        const b = Math.round(currentColor.b + (targetColor.b - currentColor.b) * this.colorTransition);

        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    animate() {
        // 清空画布
        this.ctx.fillStyle = this.getBackgroundColor();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 更新和绘制粒子
        this.particles.forEach(particle => {
            particle.update(this.mouseX, this.mouseY);
            particle.draw(this.ctx);
        });

        // 继续动画循环
        requestAnimationFrame(() => this.animate());
    }
}

// 启动动画
window.addEventListener('load', () => {
    new BackgroundAnimation();
});
