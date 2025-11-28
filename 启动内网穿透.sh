#!/bin/bash

echo "========================================="
echo "  本地网站公网访问 - 快速启动"
echo "========================================="
echo ""
echo "✅ 当前状态："
echo "   - Nginx 正在运行"
echo "   - 网站路径：/var/www/ndtool/"
echo "   - 本地地址：http://localhost"
echo ""
echo "========================================="
echo "  选择内网穿透方案"
echo "========================================="
echo ""
echo "1. Ngrok（需要注册，稳定可靠）"
echo "2. Localtunnel（无需注册，快速启动）"
echo "3. 查看详细配置指南"
echo ""
read -p "请选择方案 (1/2/3): " choice

case $choice in
  1)
    echo ""
    echo "📌 使用 Ngrok"
    echo "----------------------------------------"
    echo "步骤："
    echo "1. 访问 https://dashboard.ngrok.com/signup 注册"
    echo "2. 获取 authtoken"
    echo "3. 运行: ./ngrok config add-authtoken YOUR_TOKEN"
    echo "4. 再次运行本脚本选择 Ngrok"
    echo ""
    read -p "已完成配置？继续启动 ngrok (y/n): " confirm
    if [ "$confirm" = "y" ]; then
      echo "正在启动 ngrok..."
      ./ngrok http 80
    else
      echo "请先完成配置后再启动"
    fi
    ;;
  2)
    echo ""
    echo "📌 使用 Localtunnel（最简单）"
    echo "----------------------------------------"
    echo "正在启动 localtunnel..."
    echo "提示：首次访问时点击页面上的 'Click to Continue' 按钮"
    echo ""
    npx localtunnel --port 80
    ;;
  3)
    echo ""
    cat 本地部署指南.md
    ;;
  *)
    echo "无效选择"
    exit 1
    ;;
esac
