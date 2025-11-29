#!/bin/bash

# 华为云服务器完整项目部署脚本
# 服务器IP: 113.45.64.145

echo "========================================="
echo "  部署完整网站项目到华为云服务器"
echo "========================================="

SERVER_IP="113.45.64.145"
SERVER_USER="root"
REMOTE_PATH="/var/www/ndtool"
LOCAL_PROJECT="/home/hongfuyang/公共/网站建设"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📦 步骤1: 打包项目文件...${NC}"

# 创建临时目录
TEMP_DIR=$(mktemp -d)
echo "临时目录: $TEMP_DIR"

# 复制主要文件到临时目录
cd "$LOCAL_PROJECT"

# 先复制 resources 目录下的内容
if [ -d "resources" ]; then
    echo "复制 resources 目录..."
    # 创建必要的子目录
    mkdir -p "$TEMP_DIR/resources/css" "$TEMP_DIR/resources/js" "$TEMP_DIR/resources/src" "$TEMP_DIR/resources/locales" "$TEMP_DIR/resources/config"
    
    # 复制CSS文件
    if [ -d "resources/css" ]; then
        cp -r resources/css/* "$TEMP_DIR/resources/css/" 2>/dev/null || true
    fi
    
    # 复制JS文件
    if [ -d "resources/js" ]; then
        cp -r resources/js/* "$TEMP_DIR/resources/js/" 2>/dev/null || true
    fi
    
    # 复制src目录
    if [ -d "resources/src" ]; then
        cp -r resources/src "$TEMP_DIR/resources/" 2>/dev/null || true
    fi
    
    # 复制locales
    if [ -d "resources/locales" ]; then
        cp -r resources/locales/* "$TEMP_DIR/resources/locales/" 2>/dev/null || true
    fi
    
    # 复制config
    if [ -d "resources/config" ]; then
        cp -r resources/config/* "$TEMP_DIR/resources/config/" 2>/dev/null || true
    fi
    
    # 复制resources目录下的HTML页面（但不包括index.html）
    for html_file in resources/*.html; do
        if [ -f "$html_file" ] && [ "$(basename "$html_file")" != "index.html" ]; then
            cp "$html_file" "$TEMP_DIR/resources/"
        fi
    done
    
    # 单独复制resources/index.html到resources目录
    if [ -f "resources/index.html" ]; then
        cp resources/index.html "$TEMP_DIR/resources/"
    fi
    
    # 复制其他必要文件
    cp resources/*.js "$TEMP_DIR/resources/" 2>/dev/null || true
    cp resources/*.json "$TEMP_DIR/resources/" 2>/dev/null || true
fi

# 最后复制根目录的 index.html（这是主页，不能被覆盖）
echo "复制根目录 index.html..."
cp index.html "$TEMP_DIR/"

# 创建部署压缩包
cd "$TEMP_DIR"
tar -czf /tmp/website-deploy.tar.gz .
cd -

echo -e "${GREEN}✅ 项目打包完成${NC}"
echo ""

echo -e "${YELLOW}📤 步骤2: 上传文件到服务器...${NC}"

# 上传压缩包
scp /tmp/website-deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

echo -e "${GREEN}✅ 文件上传完成${NC}"
echo ""

echo -e "${YELLOW}🚀 步骤3: 在服务器上部署...${NC}"

# 在服务器上执行部署
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    # 停止nginx
    systemctl stop nginx
    
    # 备份旧文件（如果存在）
    if [ -d "/var/www/ndtool" ]; then
        mv /var/www/ndtool /var/www/ndtool.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # 创建网站目录
    mkdir -p /var/www/ndtool
    
    # 解压文件
    cd /var/www/ndtool
    tar -xzf /tmp/website-deploy.tar.gz
    
    # 设置权限
    chown -R www-data:www-data /var/www/ndtool
    chmod -R 755 /var/www/ndtool
    
    # 重启nginx
    systemctl start nginx
    
    echo "✅ 服务器部署完成"
EOF

echo -e "${GREEN}✅ 部署完成${NC}"
echo ""

# 清理临时文件
rm -rf "$TEMP_DIR"
rm -f /tmp/website-deploy.tar.gz

echo -e "${GREEN}========================================="
echo "  🎉 部署成功！"
echo "=========================================${NC}"
echo ""
echo "🌐 访问地址："
echo "   https://ndtool.cn"
echo "   https://www.ndtool.cn"
echo ""
echo "🔍 验证部署："
curl -I https://ndtool.cn 2>/dev/null | head -n 1

echo ""
echo "✅ 完成！"
