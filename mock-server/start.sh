#!/bin/bash

echo "=================================="
echo "  Mock Server 启动脚本"
echo "=================================="
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未检测到Node.js，请先安装Node.js"
    echo "   下载地址：https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"
echo ""

# 进入mock-server目录
cd "$(dirname "$0")"

# 检查node_modules是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    echo ""
fi

# 启动服务器
echo "🚀 正在启动Mock Server..."
echo ""
npm start
