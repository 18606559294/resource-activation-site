#!/bin/bash

echo "========================================="
echo "  本地网站服务器管理工具"
echo "========================================="
echo ""
echo "当前网站："
echo "  - 本机访问：http://localhost"
echo "  - 局域网访问：http://192.168.137.2"
echo ""
echo "========================================="
echo ""
echo "请选择操作："
echo ""
echo "1. 查看服务状态"
echo "2. 重启服务"
echo "3. 查看访问日志（实时）"
echo "4. 查看错误日志（实时）"
echo "5. 测试网站访问"
echo "6. 更新网站内容"
echo "7. 查看网络信息"
echo "8. 退出"
echo ""
read -p "请输入选项 (1-8): " choice

case $choice in
  1)
    echo ""
    echo "========== Nginx 服务状态 =========="
    sudo systemctl status nginx --no-pager
    ;;
  2)
    echo ""
    echo "正在重启 Nginx..."
    sudo systemctl restart nginx
    if [ $? -eq 0 ]; then
      echo "✅ Nginx 重启成功！"
    else
      echo "❌ Nginx 重启失败！"
    fi
    ;;
  3)
    echo ""
    echo "========== 访问日志（Ctrl+C 退出）=========="
    sudo tail -f /var/log/nginx/ndtool.access.log
    ;;
  4)
    echo ""
    echo "========== 错误日志（Ctrl+C 退出）=========="
    sudo tail -f /var/log/nginx/ndtool.error.log
    ;;
  5)
    echo ""
    echo "========== 测试网站访问 =========="
    echo ""
    echo "测试 localhost..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
      echo "✅ localhost 访问正常"
    else
      echo "❌ localhost 访问失败"
    fi
    echo ""
    echo "测试 192.168.137.2..."
    if curl -s -o /dev/null -w "%{http_code}" http://192.168.137.2 | grep -q "200"; then
      echo "✅ 局域网IP 访问正常"
    else
      echo "❌ 局域网IP 访问失败"
    fi
    echo ""
    echo "网站标题："
    curl -s http://localhost | grep -o '<title>.*</title>' | head -1
    ;;
  6)
    echo ""
    echo "========== 更新网站内容 =========="
    if [ -f "index.html" ]; then
      sudo cp index.html /var/www/ndtool/
      sudo systemctl restart nginx
      echo "✅ 网站内容已更新！"
    else
      echo "❌ 找不到 index.html 文件"
      echo "请确保在项目目录运行此脚本"
    fi
    ;;
  7)
    echo ""
    echo "========== 网络信息 =========="
    echo ""
    echo "本机IP地址："
    ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print "  " $2}'
    echo ""
    echo "默认网关："
    ip route | grep default | awk '{print "  " $3}'
    echo ""
    echo "监听端口："
    sudo netstat -tlnp | grep :80 | head -1
    ;;
  8)
    echo "退出"
    exit 0
    ;;
  *)
    echo "无效选项"
    exit 1
    ;;
esac
