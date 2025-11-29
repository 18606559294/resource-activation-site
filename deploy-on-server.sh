#!/bin/bash

# 简化的部署脚本 - 在服务器上直接执行

echo "========================================="
echo "  在服务器上重新部署网站"
echo "========================================="

# 停止nginx
echo "停止 Nginx..."
systemctl stop nginx

# 备份当前网站
echo "备份当前网站..."
if [ -d "/var/www/ndtool" ]; then
    mv /var/www/ndtool /var/www/ndtool.backup.$(date +%Y%m%d_%H%M%S)
fi

# 创建网站目录
echo "创建网站目录..."
mkdir -p /var/www/ndtool/resources

# 创建根目录的 index.html（Trae.ai 推广页面）
echo "创建主页..."
cat > /var/www/ndtool/index.html << 'ROOTINDEX'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trae.ai - 革命性的AI编程IDE | 让编程效率提升10倍</title>
    <meta name="description" content="Trae.ai是最强大的AI驱动编程IDE，智能代码补全、实时错误修复、自动重构，让您的编程效率飞速提升。">
    <style>
        * {margin: 0;padding: 0;box-sizing: border-box;}
        body {font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;line-height: 1.6;color: #333;overflow-x: hidden;}
        .container {max-width: 1200px;margin: 0 auto;padding: 0 20px;}
        nav {background: rgba(255, 255, 255, 0.95);backdrop-filter: blur(10px);position: fixed;width: 100%;top: 0;z-index: 1000;box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);}
        .nav-container {display: flex;justify-content: space-between;align-items: center;padding: 1rem 2rem;}
        .logo {font-size: 2rem;font-weight: bold;background: linear-gradient(45deg, #10b981 0%, #059669 100%);-webkit-background-clip: text;-webkit-text-fill-color: transparent;text-decoration: none;}
        .cta-button {background: linear-gradient(45deg, #10b981 0%, #059669 100%);color: white;padding: 12px 30px;border-radius: 50px;text-decoration: none;font-weight: 600;box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);}
        .hero {background: linear-gradient(135deg, #10b981 0%, #059669 100%);padding: 150px 0 100px;text-align: center;color: white;}
        .hero h1 {font-size: clamp(3rem, 8vw, 6rem);margin-bottom: 1.5rem;font-weight: 800;text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);}
        .hero-subtitle {font-size: clamp(1.5rem, 4vw, 2.5rem);margin-bottom: 2rem;opacity: 0.95;font-weight: 300;}
        .main-cta {background: white;color: #10b981;padding: 20px 50px;border-radius: 50px;text-decoration: none;font-weight: 700;font-size: 1.3rem;box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);display: inline-block;margin-top: 20px;}
        .features {padding: 100px 0;background: #f8f9fa;}
        .features h2 {text-align: center;font-size: 3rem;margin-bottom: 3rem;color: #333;}
        .features-grid {display: grid;grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));gap: 40px;}
        .feature-card {background: white;padding: 40px;border-radius: 15px;box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);text-align: center;}
        .feature-icon {font-size: 3rem;margin-bottom: 20px;}
        footer {background: #333;color: white;text-align: center;padding: 40px 0;}
        .resources-link {text-align: center;padding: 40px 0;background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);}
        .resources-link a {background: white;color: #f5576c;padding: 15px 40px;border-radius: 30px;text-decoration: none;font-weight: 600;display: inline-block;}
    </style>
</head>
<body>
    <nav>
        <div class="nav-container">
            <a href="/" class="logo">Trae.ai</a>
            <a href="https://www.trae.ai/s/WzZjEx" class="cta-button" target="_blank">立即体验</a>
        </div>
    </nav>
    
    <section class="hero">
        <div class="container">
            <h1>编程效率提升 10 倍</h1>
            <p class="hero-subtitle">AI 驱动的革命性编程IDE - Trae.ai</p>
            <a href="https://www.trae.ai/s/WzZjEx" class="main-cta" target="_blank">🚀 立即免费体验</a>
            <p style="margin-top: 20px;">💡 此链接注册免费使用</p>
        </div>
    </section>
    
    <section class="resources-link">
        <div class="container">
            <h2 style="color: white; margin-bottom: 20px;">🛠️ 需要更多工具？</h2>
            <a href="/resources/">访问资源激活工具站 →</a>
        </div>
    </section>
    
    <section class="features">
        <div class="container">
            <h2>✨ 核心功能特性</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🤖</div>
                    <h3>智能代码补全</h3>
                    <p>基于深度学习的代码补全，比传统IDE智能100倍</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔍</div>
                    <h3>实时错误检测</h3>
                    <p>AI实时分析代码，提前发现潜在bug和性能问题</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>自动代码重构</h3>
                    <p>一键智能重构代码，优化结构、提升性能</p>
                </div>
            </div>
        </div>
    </section>
    
    <footer>
        <div class="container">
            <p>&copy; 2024 Trae.ai 推广网站 | 让AI赋能每一位开发者</p>
        </div>
    </footer>
</body>
</html>
ROOTINDEX

# 创建 resources 子目录的 index.html（资源激活工具页面）
echo "创建资源页面..."
cat > /var/www/ndtool/resources/index.html << 'RESINDEX'
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>资源激活工具站</title>
    <style>
        * {margin: 0;padding: 0;box-sizing: border-box;}
        body {font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;line-height: 1.6;background: #f5f7fa;}
        .navbar {background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);color: white;padding: 1rem 0;box-shadow: 0 2px 10px rgba(0,0,0,0.1);}
        .navbar .container {max-width: 1200px;margin: 0 auto;padding: 0 20px;display: flex;justify-content: space-between;align-items: center;flex-wrap: wrap;}
        .navbar .logo {font-size: 1.5rem;font-weight: bold;text-decoration: none;color: white;}
        .navbar nav {display: flex;gap: 20px;align-items: center;flex-wrap: wrap;}
        .navbar nav a {color: white;text-decoration: none;padding: 8px 16px;border-radius: 5px;transition: background 0.3s;}
        .navbar nav a:hover {background: rgba(255,255,255,0.2);}
        .container {max-width: 1200px;margin: 0 auto;padding: 40px 20px;}
        .search-section {text-align: center;margin-bottom: 40px;}
        .search-box {display: inline-flex;gap: 10px;margin-top: 20px;}
        .search-box input {padding: 12px 20px;width: 400px;border: 2px solid #e0e0e0;border-radius: 25px;font-size: 1rem;}
        .search-box button {padding: 12px 30px;background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);color: white;border: none;border-radius: 25px;cursor: pointer;font-weight: 600;}
        .category-grid {display: grid;grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));gap: 30px;margin-top: 40px;}
        .category-card {background: white;padding: 30px;border-radius: 15px;box-shadow: 0 5px 20px rgba(0,0,0,0.1);}
        .category-card h2 {margin-bottom: 20px;color: #333;}
        .tool-list {display: flex;flex-direction: column;gap: 20px;}
        .tool-item {padding: 20px;background: #f9fafb;border-radius: 10px;}
        .tool-item h3 {color: #667eea;margin-bottom: 10px;}
        .tool-item .btn {display: inline-block;margin-top: 10px;padding: 8px 20px;background: #667eea;color: white;text-decoration: none;border-radius: 5px;}
        footer {background: #2d3748;color: white;text-align: center;padding: 30px 0;margin-top: 60px;}
        @media (max-width: 768px) {.search-box input {width: 100%;}.category-grid {grid-template-columns: 1fr;}}
    </style>
</head>
<body>
    <header class="navbar">
        <div class="container">
            <a href="/resources/" class="logo">资源激活</a>
            <nav>
                <a href="/" style="font-weight: 800;">← 返回 Trae 主页</a>
                <a href="/resources/">工具</a>
                <a href="/resources/">资源</a>
                <a href="/resources/">安全</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <section class="search-section">
            <div class="search-box">
                <input type="text" placeholder="搜索资源...">
                <button>搜索</button>
            </div>
        </section>

        <section class="category-grid">
            <div class="category-card">
                <h2>常用工具</h2>
                <div class="tool-list">
                    <div class="tool-item">
                        <h3>资源激活</h3>
                        <p>快速激活各类资源和软件</p>
                        <a href="#" class="btn">探索</a>
                    </div>
                    <div class="tool-item">
                        <h3>安全检测</h3>
                        <p>全面的安全防护工具</p>
                        <a href="#" class="btn">探索</a>
                    </div>
                </div>
            </div>

            <div class="category-card">
                <h2>热门资源</h2>
                <div class="tool-list">
                    <div class="tool-item">
                        <h3>软件资源</h3>
                        <p>精选优质软件资源</p>
                        <a href="#" class="btn">探索</a>
                    </div>
                    <div class="tool-item">
                        <h3>工具资源</h3>
                        <p>实用工具集合</p>
                        <a href="#" class="btn">探索</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2024 资源激活工具站 | Trae.ai 合作伙伴</p>
            <p style="margin-top: 10px; font-size: 0.85rem; color: #999;">
                ⚠️ 此网站用于个人学习交流使用
            </p>
        </div>
    </footer>
</body>
</html>
RESINDEX

# 设置权限
echo "设置文件权限..."
chown -R www-data:www-data /var/www/ndtool
chmod -R 755 /var/www/ndtool

# 重启nginx
echo "重启 Nginx..."
systemctl start nginx
systemctl enable nginx

echo ""
echo "✅ ====== 部署完成！ ======"
echo ""
echo "🌐 访问地址："
echo "   - 主页（Trae.ai）: https://ndtool.cn"
echo "   - 资源工具站: https://ndtool.cn/resources/"
echo ""
echo "🧪 测试："
curl -I http://localhost 2>/dev/null | head -n 1
echo ""
