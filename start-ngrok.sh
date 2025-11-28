#!/bin/bash

echo "========================================="
echo "  启动 Ngrok 内网穿透"
echo "========================================="
echo ""
echo "📌 使用说明："
echo "1. 首先需要在 https://dashboard.ngrok.com/signup 注册账号"
echo "2. 获取你的 authtoken"
echo "3. 运行: ./ngrok config add-authtoken YOUR_TOKEN"
echo "4. 然后运行本脚本"
echo ""
echo "正在启动 ngrok，映射本地 80 端口..."
echo ""

# 启动 ngrok
./ngrok http 80
