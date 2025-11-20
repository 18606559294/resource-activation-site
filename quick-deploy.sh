#!/bin/bash

echo "=== 快速部署到腾讯云服务器 ==="
echo "域名: ndtool.cn"
echo "服务器: 82.157.181.51"
echo ""

# 检查必要工具
if ! command -v ssh &> /dev/null; then
    echo "❌ 错误：需要安装SSH客户端"
    echo "Windows用户请安装Git Bash或WSL"
    exit 1
fi

if ! command -v scp &> /dev/null; then
    echo "❌ 错误：需要SCP工具进行文件传输"
    exit 1
fi

# 服务器配置
SERVER_IP="82.157.181.51"
SERVER_USER="root"
DOMAIN="ndtool.cn"
DEPLOY_PATH="/var/www/trae-promo"

echo "📦 准备部署文件..."
if [ ! -f "index.html" ]; then
    echo "❌ 错误：找不到 index.html 文件"
    exit 1
fi

# 创建临时部署包
tar -czf trae-deploy.tar.gz index.html

echo "📤 上传文件到服务器..."
scp trae-deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

if [ $? -ne 0 ]; then
    echo "❌ 文件上传失败，请检查："
    echo "1. 服务器IP是否正确: ${SERVER_IP}"
    echo "2. SSH密钥是否已配置"
    echo "3. 网络连接是否正常"
    exit 1
fi

echo "🚀 在服务器上部署..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
# 进入临时目录
cd /tmp

# 解压部署包
tar -xzf trae-deploy.tar.gz

# 更新系统包
echo "📥 更新系统包..."
apt update

# 安装nginx
echo "📥 安装nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
fi

# 创建网站目录
echo "📁 创建网站目录..."
mkdir -p ${DEPLOY_PATH}

# 移动网站文件
echo "📋 部署网站文件..."
mv index.html ${DEPLOY_PATH}/

# 设置权限
echo "🔐 设置文件权限..."
chown -R www-data:www-data ${DEPLOY_PATH}
chmod -R 755 ${DEPLOY_PATH}

# 配置nginx
echo "⚙️ 配置nginx..."
cat > /etc/nginx/sites-available/trae-promo << 'NGINX_CONF'
server {
    listen 80;
    server_name ndtool.cn www.ndtool.cn;

    root /var/www/trae-promo;
    index index.html;

    # 日志配置
    access_log /var/log/nginx/trae-promo.access.log;
    error_log /var/log/nginx/trae-promo.error.log;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 静态资源缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 主页面
    location / {
        try_files \$uri \$uri/ =404;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINX_CONF

# 启用网站配置
ln -sf /etc/nginx/sites-available/trae-promo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试nginx配置
echo "🔍 测试nginx配置..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ nginx配置测试通过"
    # 重启nginx
    systemctl restart nginx
    systemctl enable nginx
    echo "✅ nginx重启成功"
else
    echo "❌ nginx配置有误，请检查"
    exit 1
fi

# 配置防火墙
echo "🔥 配置防火墙..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# 清理临时文件
rm -f /tmp/trae-deploy.tar.gz

echo "✅ 服务器部署完成！"
EOF

# 清理本地临时文件
rm -f trae-deploy.tar.gz

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 下一步操作："
echo "1. 访问 http://ndtool.cn 查看网站"
echo "2. 访问 http://82.157.181.51 直接通过IP查看"
echo ""
echo "📝 域名DNS配置："
echo "请在阿里云域名控制台添加以下DNS记录："
echo "- 主机记录: @"
echo "- 记录类型: A"
echo "- 记录值: 82.157.181.51"
echo "- TTL: 600"
echo ""
echo "如需启用HTTPS，请配置SSL证书。"