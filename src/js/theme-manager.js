// 主题管理器
class ThemeManager {
    constructor() {
        this.themes = [
            'default',
            'deep-blue',
            'emerald',
            'violet',
            'orange',
            'graphite',
            'ocean',
            'nature',
            'sunset'
        ];
        
        this.currentTheme = localStorage.getItem('theme') || 'default';
        this.isDark = localStorage.getItem('isDark') === 'true' || 
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.init();
    }
    
    init() {
        // 初始化主题
        this.applyTheme(this.currentTheme);
        this.applyDarkMode(this.isDark);
        
        // 添加主题切换器
        this.createThemeSelector();
        
        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => this.applyDarkMode(e.matches));
    }
    
    createThemeSelector() {
        const navbar = document.querySelector('.navbar-container');
        const themeSelector = document.createElement('div');
        themeSelector.className = 'theme-selector';
        
        // 创建主题切换按钮
        const themeButton = document.createElement('button');
        themeButton.className = 'theme-toggle';
        themeButton.setAttribute('aria-label', '切换主题');
        themeButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
            </svg>
        `;
        
        // 创建主题下拉菜单
        const themeMenu = document.createElement('div');
        themeMenu.className = 'theme-menu';
        
        this.themes.forEach(theme => {
            const themeOption = document.createElement('button');
            themeOption.className = 'theme-option';
            themeOption.setAttribute('data-theme', theme);
            themeOption.textContent = this.getThemeName(theme);
            themeOption.addEventListener('click', () => this.applyTheme(theme));
            themeMenu.appendChild(themeOption);
        });
        
        // 添加深色模式切换
        const darkModeToggle = document.createElement('button');
        darkModeToggle.className = 'dark-mode-toggle';
        darkModeToggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;
        darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        
        themeSelector.appendChild(themeButton);
        themeSelector.appendChild(themeMenu);
        themeSelector.appendChild(darkModeToggle);
        
        // 显示/隐藏主题菜单
        themeButton.addEventListener('click', () => {
            themeMenu.classList.toggle('show');
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (!themeSelector.contains(e.target)) {
                themeMenu.classList.remove('show');
            }
        });
        
        navbar.appendChild(themeSelector);
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        
        // 更新选中状态
        const options = document.querySelectorAll('.theme-option');
        options.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });
    }
    
    toggleDarkMode() {
        this.isDark = !this.isDark;
        this.applyDarkMode(this.isDark);
    }
    
    applyDarkMode(isDark) {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('isDark', isDark);
        this.isDark = isDark;
    }
    
    getThemeName(theme) {
        const names = {
            'default': '默认蓝',
            'deep-blue': '深邃蓝',
            'emerald': '翡翠绿',
            'violet': '紫罗兰',
            'orange': '橙色活力',
            'graphite': '石墨灰',
            'ocean': '海洋',
            'nature': '自然',
            'sunset': '日落'
        };
        return names[theme] || theme;
    }
}

// 初始化主题管理器
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});
