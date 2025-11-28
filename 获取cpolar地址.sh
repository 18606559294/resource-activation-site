#!/bin/bash

echo "========================================="
echo "  获取 Cpolar 公网访问地址"
echo "========================================="
echo ""

# 检查 cpolar 是否运行
if ! pgrep -x "cpolar" > /dev/null; then
    echo "❌ Cpolar 未运行"
    echo ""
    echo "请先运行："
    echo "  ./启动cpolar.sh"
    exit 1
fi

echo "✅ Cpolar 正在运行"
echo ""

# 获取 Web 界面地址
echo "📊 Web 管理界面："
echo "   http://127.0.0.1:9200"
echo ""

# 尝试从日志获取地址
echo "🌐 公网访问地址："
echo ""

# 等待几秒让隧道建立
sleep 2

# 查看 cpolar 配置目录
if [ -f ~/.cpolar/cpolar.yml ]; then
    echo "配置文件已找到"
fi

echo ""
echo "========================================="
echo "  如何查看公网地址"
echo "========================================="
echo ""
echo "方式 1：查看启动 cpolar 的终端窗口"
echo "   会显示类似："
echo "   Forwarding    http://xxxxxx.cpolar.cn -> http://localhost:80"
echo "   Forwarding    https://xxxxxx.cpolar.cn -> http://localhost:80"
echo ""
echo "方式 2：打开 Web 管理界面"
echo "   访问：http://127.0.0.1:9200"
echo "   在界面中查看"
echo ""
echo "方式 3：查看 Cpolar 控制台"
echo "   访问：https://dashboard.cpolar.com/"
echo "   登录后查看在线隧道"
echo ""
echo "========================================="
echo ""
echo "公网地址获取后，任何人都可以直接访问！"
echo "无需密码、无需配置！"
echo ""
