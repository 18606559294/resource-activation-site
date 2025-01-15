@echo off
echo 正在设置网站...

:: 检查 XAMPP 是否已安装
if not exist "C:\xampp" (
    echo XAMPP 未安装！
    echo 请先安装 XAMPP：
    echo 1. 访问 https://www.apachefriends.org/
    echo 2. 下载并安装 XAMPP
    echo 3. 安装完成后重新运行此脚本
    pause
    exit
)

:: 停止 Apache（如果正在运行）
echo 正在停止 Apache...
"C:\xampp\apache_stop.bat"

:: 创建网站目录
if not exist "C:\xampp\htdocs\resource-activation-site" (
    echo 正在创建网站目录...
    mkdir "C:\xampp\htdocs\resource-activation-site"
)

:: 复制网站文件
echo 正在复制网站文件...
xcopy /E /Y /I "%~dp0*" "C:\xampp\htdocs\resource-activation-site"

:: 启动 Apache
echo 正在启动 Apache...
"C:\xampp\apache_start.bat"

echo.
echo 设置完成！
echo 请访问：http://localhost/resource-activation-site
echo.
pause
