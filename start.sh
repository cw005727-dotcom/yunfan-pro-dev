#!/bin/bash
# 云帆跨境 PRO 启动脚本
# 用法: ./start.sh

cd ~/yunfan-pro-dev

echo "=== 停止旧进程 ==="
pkill -f "vite" 2>/dev/null
pkill -f "python api_server.py" 2>/dev/null
sleep 1

echo "=== 启动后端 (8505) ==="
python api_server.py &
BACKEND_PID=$!
echo "后端 PID: $BACKEND_PID"

sleep 2

echo "=== 启动前端 (8506) ==="
npm run dev &
FRONTEND_PID=$!
echo "前端 PID: $FRONTEND_PID"

sleep 2

echo ""
echo "=== 服务状态 ==="
echo "后端: http://localhost:8505"
echo "前端: http://localhost:8506"
echo ""
echo "停止命令: pkill -f 'vite'; pkill -f 'api_server.py'"
