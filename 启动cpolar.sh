#!/bin/bash

echo "========================================="
echo "  Cpolar 内网穿透 - 启动工具"
echo "========================================="
echo ""

# 检查是否已配置 authtoken
if [ ! -f ~/.cpolar/cpolar.yml ]; then
    echo "⚠️  检测到未配置 Cpolar"
    echo ""
    echo "请先完成以下步骤："
    echo ""
    echo "1. 注册账号：https://dashboard.cpolar.com/signup"
    echo "2. 获取 authtoken：登录后在控制台获取"
    echo "3. 配置 token："
    echo "   cpolar authtoken YOUR_TOKEN_HERE"
    echo ""
    echo "配置完成后，再次运行本脚本"
    echo ""
    read -p "是否现在配置 authtoken？(y/n): " config_now
    
    if [ "$config_now" = "y" ]; then
        echo ""
        read -p "请输入你的 authtoken: " token
        cpolar authtoken "$token"
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Authtoken 配置成功！"
            echo ""
        else
            echo ""
            echo "❌ 配置失败，请检查 token 是否正确"
            exit 1
        fi
    else
        exit 0
    fi
fi

echo "✅ Cpolar 已配置完成"
echo ""
echo "========================================="
echo "  启动选项"
echo "========================================="
echo ""
echo "1. 启动 HTTP 隧道（推荐）"
echo "2. 启动并查看实时日志"
echo "3. 查看当前状态"
echo "4. 停止所有隧道"
echo "5. 打开 Web 管理界面"
echo "6. 查看配置指南"
echo ""
read -p "请选择 (1-6): " choice

case $choice in
    1)
        echo ""
        echo "========================================="
        echo "  正在启动 Cpolar HTTP 隧道"
        echo "========================================="
        echo ""
        echo "本地端口：80"
        echo "Web管理界面：http://localhost:9200"
        echo ""
        echo "提示："
        echo "- 启动后会显示公网访问地址"
        echo "- 访客无需密码，直接访问即可"
        echo "- 按 Ctrl+C 停止服务"
        echo ""
        sleep 2
        
        cpolar http 80
        ;;
    2)
        echo ""
        echo "========================================="
        echo "  启动 Cpolar（带日志）"
        echo "========================================="
        echo ""
        
        cpolar http 80 --log stdout --log-level debug
        ;;
    3)
        echo ""
        echo "========================================="
        echo "  Cpolar 状态"
        echo "========================================="
        echo ""
        
        if pgrep -x "cpolar" > /dev/null; then
            echo "✅ Cpolar 正在运行"
            echo ""
            echo "进程信息："
            ps aux | grep cpolar | grep -v grep
            echo ""
            echo "访问 http://localhost:9200 查看详细信息"
        else
            echo "❌ Cpolar 未运行"
        fi
        ;;
    4)
        echo ""
        echo "停止所有 Cpolar 隧道..."
        pkill cpolar
        if [ $? -eq 0 ]; then
            echo "✅ 已停止所有隧道"
        else
            echo "ℹ️  没有运行中的隧道"
        fi
        ;;
    5)
        echo ""
        echo "========================================="
        echo "  打开 Web 管理界面"
        echo "========================================="
        echo ""
        
        if pgrep -x "cpolar" > /dev/null; then
            echo "✅ Cpolar 正在运行"
            echo ""
            echo "Web 管理界面地址："
            echo "http://localhost:9200"
            echo ""
            echo "在浏览器中打开上述地址即可查看："
            echo "- 实时隧道状态"
            echo "- 请求日志"
            echo "- 流量统计"
            echo ""
            
            # 尝试打开浏览器
            if command -v xdg-open > /dev/null; then
                read -p "是否现在打开浏览器？(y/n): " open_browser
                if [ "$open_browser" = "y" ]; then
                    xdg-open http://localhost:9200
                fi
            fi
        else
            echo "❌ Cpolar 未运行"
            echo "请先启动 Cpolar（选项 1）"
        fi
        ;;
    6)
        echo ""
        cat Cpolar配置指南.md
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac
