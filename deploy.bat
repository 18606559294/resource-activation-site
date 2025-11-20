@echo off
echo === Trae.ai推广网站Windows部署脚本 ===

REM 设置变量（已配置为您的实际信息）
SET DOMAIN=ndtool.cn
SET SERVER_IP=82.157.181.51
SET SERVER_USER=root
SET DEPLOY_PATH=/var/www/trae-promo

echo 检查必需文件...
if not exist "index.html" (
    echo ❌ 错误：找不到 index.html 文件
    pause
    exit /b 1
)

echo ✅ 本地文件检查完成

REM 检查是否有WinSCP（用于文件传输）
where winscp >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误：需要安装 WinSCP 用于文件传输
    echo 请从 https://winscp.net 下载安装
    pause
    exit /b 1
)

REM 检查是否有PuTTY（用于SSH连接）
where plink >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误：需要安装 PuTTY 用于SSH连接
    echo 请从 https://www.putty.org 下载安装
    pause
    exit /b 1
)

echo 📦 创建部署包...
powershell "Compress-Archive -Path 'index.html' -DestinationPath 'trae-promo.zip' -Force"

echo 📤 上传文件到服务器...
winscp /command ^
    "open sftp://%SERVER_USER%@%SERVER_IP%" ^
    "cd /tmp" ^
    "put trae-promo.zip" ^
    "exit"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 文件上传失败
    pause
    exit /b 1
)

echo 🚀 在服务器上部署...
plink %SERVER_USER%@%SERVER_IP% -batch "bash -c '"
echo "#!/bin/bash"
echo ""
echo "# 安装nginx（如果尚未安装）"
echo "if ! command -v nginx ^&^> /dev/null; then"
echo "    echo '📥 安装nginx...'"
echo "    apt update"
echo "    apt install -y nginx"
echo "fi"
echo ""
echo "# 创建网站目录"
echo "mkdir -p %DEPLOY_PATH%"
echo ""
echo "# 解压文件"
echo "cd /tmp"
echo "unzip -o trae-promo.zip -d %DEPLOY_PATH%"
echo ""
echo "# 设置权限"
echo "chown -R www-data:www-data %DEPLOY_PATH%"
echo "chmod -R 755 %DEPLOY_PATH%"
echo ""
echo "# 配置nginx"
echo "cat ^> /etc/nginx/sites-available/trae-promo ^<^< 'EOL'"
echo "server {"
echo "    listen 80;"
echo "    server_name %DOMAIN% www.%DOMAIN%;"
echo ""
echo "    root %DEPLOY_PATH%;"
echo "    index index.html;"
echo ""
echo "    # Gzip压缩"
echo "    gzip on;"
echo "    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;"
echo ""
echo "    # 安全头"
echo "    add_header X-Frame-Options \"SAMEORIGIN\" always;"
echo "    add_header X-Content-Type-Options \"nosniff\" always;"
echo "    add_header X-XSS-Protection \"1; mode=block\" always;"
echo ""
echo "    location / {"
echo "        try_files \$uri \$uri/ =404;"
echo "    }"
echo "}"
echo "EOL"
echo ""
echo "# 启用网站"
echo "ln -sf /etc/nginx/sites-available/trae-promo /etc/nginx/sites-enabled/"
echo "rm -f /etc/nginx/sites-enabled/default"
echo ""
echo "# 测试并重启nginx"
echo "nginx -t"
echo "systemctl restart nginx"
echo "systemctl enable nginx"
echo ""
echo "# 配置防火墙"
echo "ufw allow 22"
echo "ufw allow 80"
echo "ufw allow 443"
echo "ufw --force enable"
echo ""
echo "echo '✅ 服务器配置完成'"
""

REM 清理本地临时文件
del trae-promo.zip

echo.
echo 🎉 部署完成！
echo.
echo 📝 请完成以下步骤：
echo    1. 将域名 %DOMAIN% 的A记录指向服务器IP %SERVER_IP%
echo    2. 访问 http://%DOMAIN% 查看网站
echo    3. （可选）配置SSL证书以启用HTTPS
echo.
pause