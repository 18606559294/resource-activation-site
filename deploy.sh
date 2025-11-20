#!/bin/bash

# Trae.ai推广网站部署脚本
# 适用于腾讯云服务器部署

echo "=== Trae.ai推广网站自动部署脚本 ==="

# 设置变量
DOMAIN="ndtool.cn"        # 您的域名
REMOTE_USER="root"        # 腾讯云服务器用户名
REMOTE_IP="82.157.181.51" # 您的腾讯云服务器IP
REMOTE_PATH="/var/www/trae-promo"  # 服务器上的部署路径

# 检查本地文件
if [ ! -f "index.html" ]; then
    echo "❌ 错误：找不到 index.html 文件"
    exit 1
fi

echo "✅ 本地文件检查完成"

# 创建部署包
echo "📦 创建部署包..."
tar -czf trae-promo.tar.gz index.html

# 上传到服务器
echo "📤 上传文件到腾讯云服务器..."
scp trae-promo.tar.gz ${REMOTE_USER}@${REMOTE_IP}:/tmp/

# 在服务器上执行部署
echo "🚀 在服务器上部署..."
ssh ${REMOTE_USER}@${REMOTE_IP} << EOF
    # 安装nginx（如果尚未安装）
    if ! command -v nginx &> /dev/null; then
        echo "📥 安装nginx..."
        apt update
        apt install -y nginx
    fi

    # 创建网站目录
    mkdir -p ${REMOTE_PATH}

    # 解压文件
    cd /tmp
    tar -xzf trae-promo.tar.gz -C ${REMOTE_PATH}

    # 设置权限
    chown -R www-data:www-data ${REMOTE_PATH}
    chmod -R 755 ${REMOTE_PATH}

    # 配置nginx
    cat > /etc/nginx/sites-available/trae-promo << 'EOL'
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    root ${REMOTE_PATH};
    index index.html;

    # 压缩配置
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存配置
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 主页面
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOL

    # 启用网站
    ln -sf /etc/nginx/sites-available/trae-promo /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # 测试nginx配置
    nginx -t

    # 重启nginx
    systemctl restart nginx
    systemctl enable nginx

    # 配置防火墙
    ufw allow 22
    ufw allow 80
    ufw allow 443
    ufw --force enable

    echo "✅ 服务器配置完成"
EOF

# 清理临时文件
rm trae-promo.tar.gz

echo "🎉 部署完成！"
echo "📝 请完成以下步骤："
echo "   1. 将域名 ${DOMAIN} 的A记录指向服务器IP ${REMOTE_IP}"
echo "   2. 访问 http://${DOMAIN} 查看网站"
echo "   3. （可选）配置SSL证书以启用HTTPS"