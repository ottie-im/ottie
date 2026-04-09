#!/usr/bin/env bash
# Ottie Desktop 启动脚本（含 Screenpipe）
# 用法: ./start-with-screenpipe.sh
#
# 1. 检查 Screenpipe 是否已安装
# 2. 启动 Screenpipe（如果有）
# 3. 启动 Ottie Desktop

set -euo pipefail

echo "🦦 Ottie Desktop 启动中..."

# Check if Screenpipe is available
if command -v screenpipe >/dev/null 2>&1 || npx screenpipe@latest --version >/dev/null 2>&1; then
  echo "✅ Screenpipe 可用，启动屏幕感知..."

  # Check if already running
  if curl -sf http://localhost:3030/health >/dev/null 2>&1; then
    echo "   Screenpipe 已在运行"
  else
    npx screenpipe@latest record &
    SCREENPIPE_PID=$!
    echo "   Screenpipe 启动 (PID: $SCREENPIPE_PID)"
    sleep 3
  fi
else
  echo "⚠️  Screenpipe 未安装，屏幕感知功能不可用"
  echo "   安装方式: npx screenpipe@latest record"
  echo "   Ottie 其他功能不受影响"
fi

# Start Ottie Desktop
echo ""
echo "🦦 启动 Ottie Desktop..."

# Find the app bundle
APP_PATH="$(dirname "$0")/../src-tauri/target/release/bundle/macos/Ottie.app"
if [ -d "$APP_PATH" ]; then
  open "$APP_PATH"
else
  echo "未找到 Ottie.app，使用 Vite 开发模式..."
  cd "$(dirname "$0")/.."
  npx vite --port 3000
fi
