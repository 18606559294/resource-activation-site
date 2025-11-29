#!/bin/bash

# 华为云服务器一键部署脚本
# 服务器IP: 113.45.64.145
# 操作系统: Ubuntu 24.04 server 64bit

echo "========================================="
echo "  华为云服务器网站一键部署脚本"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 更新系统包
echo -e "${YELLOW}📦 步骤1/7: 更新系统...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✅ 系统更新完成${NC}"
echo ""

# 安装必要软件
echo -e "${YELLOW}📥 步骤2/7: 安装nginx和必要工具...${NC}"
apt install -y nginx curl wget git unzip
echo -e "${GREEN}✅ 软件安装完成${NC}"
echo ""

# 创建网站目录
echo -e "${YELLOW}📁 步骤3/7: 创建网站目录...${NC}"
mkdir -p /var/www/ndtool
cd /var/www/ndtool
echo -e "${GREEN}✅ 目录创建完成${NC}"
echo ""

# 创建网站文件
echo -e "${YELLOW}📄 步骤4/7: 创建网站文件...${NC}"
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ND Tool - 专业开发工具平台</title>
    <meta name="description" content="ND Tool提供专业的开发工具和服务，助力您的项目开发">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 100px 0;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            font-weight: 800;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .subtitle {
            font-size: 1.5rem;
            opacity: 0.95;
            margin-bottom: 30px;
        }
        .status {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            color: white;
            padding: 10px 25px;
            border-radius: 30px;
            font-size: 1rem;
            margin-top: 20px;
            border: 2px solid rgba(255,255,255,0.3);
        }
        .features {
            padding: 80px 0;
            background: white;
        }
        .features h2 {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
            color: #333;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 40px;
        }
        .feature-card {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            border: 1px solid #f0f0f0;
        }
        .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.2);
        }
        .feature-icon {
            font-size: 3.5rem;
            margin-bottom: 20px;
        }
        .feature-card h3 {
            font-size: 1.5rem;
            margin-bottom: 15px;
            color: #333;
        }
        .feature-card p {
            color: #666;
            line-height: 1.8;
        }
        .info-section {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 60px 0;
            color: white;
            text-align: center;
        }
        .info-section h2 {
            font-size: 2rem;
            margin-bottom: 30px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .info-item {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            padding: 25px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .info-item strong {
            display: block;
            font-size: 1.2rem;
            margin-bottom: 10px;
        }
        footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 40px 0;
        }
        footer p {
            margin: 10px 0;
            opacity: 0.8;
        }
        .btn {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 15px 40px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
            transition: all 0.3s;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }
        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }
            .subtitle {
                font-size: 1.2rem;
            }
            .feature-grid, .info-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>🚀 ND Tool</h1>
            <p class="subtitle">专业开发工具平台 · 高效 · 稳定 · 安全</p>
            <div class="status">✅ 华为云服务器运行中</div>
        </div>
    </header>

    <section class="features">
        <div class="container">
            <h2>✨ 核心功能特性</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">🛠️</div>
                    <h3>开发工具箱</h3>
                    <p>提供各类专业开发工具，包括代码编辑器、调试工具、性能分析等，全面提升开发效率</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>高性能架构</h3>
                    <p>基于华为云ECS服务器，采用Nginx高性能Web服务器，保证服务快速响应和稳定运行</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <h3>安全防护</h3>
                    <p>企业级安全保障，HTTPS加密传输，多层安全防护机制，保护您的数据安全</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">☁️</div>
                    <h3>云端部署</h3>
                    <p>基于华为云基础设施，享受云计算带来的弹性扩展和高可用性优势</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3>响应式设计</h3>
                    <p>完美适配各种设备和屏幕尺寸，无论PC、平板还是手机都能获得最佳体验</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎯</div>
                    <h3>专业服务</h3>
                    <p>提供专业的技术支持和服务，7×24小时保障您的业务稳定运行</p>
                </div>
            </div>
        </div>
    </section>

    <section class="info-section">
        <div class="container">
            <h2>📊 服务器信息</h2>
            <div class="info-grid">
                <div class="info-item">
                    <strong>🌐 公网IP</strong>
                    <span>113.45.64.145</span>
                </div>
                <div class="info-item">
                    <strong>💻 操作系统</strong>
                    <span>Ubuntu 24.04 LTS</span>
                </div>
                <div class="info-item">
                    <strong>🏢 云服务商</strong>
                    <span>华为云 · 华南广州</span>
                </div>
                <div class="info-item">
                    <strong>⚙️ Web服务器</strong>
                    <span>Nginx (高性能)</span>
                </div>
            </div>
            <a href="#" class="btn">了解更多</a>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>&copy; 2024 ND Tool - 专业开发工具平台</p>
            <p>部署于华为云 ECS | Powered by Nginx</p>
            <p style="margin-top: 20px; font-size: 0.9rem;">服务器地址: http://113.45.64.145</p>
        </div>
    </footer>

    <script>
        // 添加平滑滚动效果
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // 显示部署时间
        console.log('网站部署时间:', new Date().toLocaleString('zh-CN'));
    </script>
</body>
</html>
EOF
echo -e "${GREEN}✅ 网站文件创建完成${NC}"
echo ""

# 配置nginx
echo -e "${YELLOW}⚙️ 步骤5/7: 配置nginx...${NC}"
cat > /etc/nginx/sites-available/ndtool << 'NGINX_EOF'
server {
    listen 80;
    server_name ndtool.cn www.ndtool.cn 113.45.64.145 _;

    root /var/www/ndtool;
    index index.html index.htm;

    # 日志配置
    access_log /var/log/nginx/ndtool.access.log;
    error_log /var/log/nginx/ndtool.error.log;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/x-javascript;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # 静态资源缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # HTML文件缓存
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # 主页面
    location / {
        try_files $uri $uri/ =404;
    }

    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
NGINX_EOF

# 启用网站配置
ln -sf /etc/nginx/sites-available/ndtool /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo -e "${GREEN}✅ Nginx配置完成${NC}"
echo ""

# 设置文件权限
echo -e "${YELLOW}🔐 步骤6/7: 设置文件权限...${NC}"
chown -R www-data:www-data /var/www/ndtool
chmod -R 755 /var/www/ndtool
echo -e "${GREEN}✅ 权限设置完成${NC}"
echo ""

# 测试并重启nginx
echo -e "${YELLOW}🔄 步骤7/7: 测试并重启nginx...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    systemctl restart nginx
    systemctl enable nginx
    echo -e "${GREEN}✅ Nginx重启成功${NC}"
else
    echo -e "${RED}❌ Nginx配置测试失败，请检查配置${NC}"
    exit 1
fi
echo ""

# 配置防火墙（如果UFW已安装）
if command -v ufw &> /dev/null; then
    echo -e "${YELLOW}🔥 配置防火墙...${NC}"
    ufw allow 22 2>/dev/null
    ufw allow 80 2>/dev/null
    ufw allow 443 2>/dev/null
    echo "y" | ufw enable 2>/dev/null
    echo -e "${GREEN}✅ 防火墙配置完成${NC}"
    echo ""
fi

# 显示部署结果
echo ""
echo -e "${GREEN}========================================="
echo "  ✅ 网站部署完成！"
echo "=========================================${NC}"
echo ""
echo -e "${YELLOW}📋 服务器信息：${NC}"
echo "   🌐 公网IP: 113.45.64.145"
echo "   📁 网站路径: /var/www/ndtool"
echo "   ⚙️ Nginx配置: /etc/nginx/sites-available/ndtool"
echo ""
echo -e "${YELLOW}🌐 访问地址：${NC}"
echo "   👉 http://113.45.64.145"
echo "   👉 http://ndtool.cn (需配置DNS)"
echo ""
echo -e "${YELLOW}🔍 常用命令：${NC}"
echo "   查看nginx状态:  systemctl status nginx"
echo "   重启nginx:      systemctl restart nginx"
echo "   查看访问日志:   tail -f /var/log/nginx/ndtool.access.log"
echo "   查看错误日志:   tail -f /var/log/nginx/ndtool.error.log"
echo "   测试网站:       curl http://localhost"
echo ""
echo -e "${YELLOW}📝 下一步：${NC}"
echo "   1. 在浏览器访问 http://113.45.64.145 测试网站"
echo "   2. 配置域名DNS解析（可选）"
echo "   3. 安装SSL证书启用HTTPS（可选）"
echo ""
echo -e "${GREEN}🎉 祝您使用愉快！${NC}"
echo ""

# 自动测试网站
echo -e "${YELLOW}🧪 正在测试网站...${NC}"
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ 网站测试成功！HTTP状态码: $HTTP_CODE${NC}"
else
    echo -e "${RED}⚠️ 网站测试异常，HTTP状态码: $HTTP_CODE${NC}"
fi
echo ""
