// 主题管理器
class ThemeManager {
    /** @type {string[]} */
    themes;
    /** @type {string} */
    currentTheme;
    /** @type {boolean} */
    isDark;

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
        
        /** @type {string | null} */
        const storedTheme = localStorage.getItem('theme');
        this.currentTheme = storedTheme !== null ? storedTheme : 'default';
        
        /** @type {string | null} */
        const storedDarkMode = localStorage.getItem('isDark');
        this.isDark = storedDarkMode === 'true' || 
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
            .addEventListener('change', 
                /** @param {MediaQueryListEvent} e */
                e => this.applyDarkMode(e.matches)
            );
    }
    
    createThemeSelector() {
        /** @type {HTMLElement | null} */
        const navbar = document.querySelector('.navbar-container');
        if (!navbar) {
            console.error('Navbar container not found');
            return;
        }
        
        /** @type {HTMLDivElement} */
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
            themeOption.addEventListener('click', 
                /** @param {MouseEvent} event */
                (event) => this.applyTheme(theme)
            );
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
        darkModeToggle.addEventListener('click', 
            /** @param {MouseEvent} e */
            () => this.toggleDarkMode()
        );
        
        themeSelector.appendChild(themeButton);
        themeSelector.appendChild(themeMenu);
        themeSelector.appendChild(darkModeToggle);
        
        // 显示/隐藏主题菜单
            themeButton.addEventListener('click', 
                /** @param {MouseEvent} event */
                (event) => {
                    themeMenu.classList.toggle('show');
                }
            );
        
        // 点击外部关闭菜单
        document.addEventListener('click', 
            /** @param {MouseEvent} event */
            (event) => {
                if (!themeSelector.contains(/** @type {Node} */(event.target))) {
                    themeMenu.classList.remove('show');
                }
            }
        );
        
        navbar.appendChild(themeSelector);
    }
    
    /**
     * 应用主题
     * @param {string} theme 主题名称
     */
    applyTheme(theme) {
        // 添加切换动画
        document.documentElement.classList.add('theme-transition');
        
        // 设置新主题
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        
        // 更新选中状态
        const options = document.querySelectorAll('.theme-option');
        options.forEach(option => {
            const btn = /** @type {HTMLButtonElement} */(option);
            btn.classList.toggle('active', btn.dataset.theme === theme);
            btn.setAttribute('aria-pressed', btn.dataset.theme === theme ? 'true' : 'false');
        });
        
        // 移除动画
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 300);
    }
    
    /**
     * 切换深色模式
     * @returns {void}
     */
    toggleDarkMode() {
        this.isDark = !this.isDark;
        this.applyDarkMode(this.isDark);
    }
    
    /**
     * 应用深色模式
     * @param {boolean} isDark 是否启用深色模式
     * @returns {void}
     */
    applyDarkMode(isDark) {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('isDark', isDark);
        this.isDark = isDark;
    }
    
    /**
     * 获取主题名称
     * @param {string} theme 主题标识符
     * @returns {string} 主题显示名称
     */
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

/**
 * @typedef {Object} Window
 * @property {ThemeManager} themeManager
 */

/**
 * @typedef {Object} Storage
 * @property {(key: string) => string | null} getItem
 * @property {(key: string, value: string) => void} setItem
 */

// 初始化主题管理器
document.addEventListener('DOMContentLoaded', () => {
    /** @type {ThemeManager} */
    window.themeManager = new ThemeManager();
});
