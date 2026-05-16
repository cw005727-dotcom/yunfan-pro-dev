#!/bin/bash
# 搬瓦工 CN2 GIA-E 库存监控
# 有货时发 Telegram 通知
# 依赖：curl, date

BOT_TOKEN="8611187791:AAGNwpeNScAerXxrt3g6JjLa_Cur8fhoi8o"
CHAT_ID="6641785946"
LOG="/Users/chensan/yunfan-pro-dev/logs/bwg_monitor.log"
STATE_FILE="/tmp/bwg_last_stock.txt"

mkdir -p "$(dirname "$LOG")"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

check_stock() {
  local url="$1"
  local name="$2"
  local page
  page=$(curl -s --max-time 15 -L \
    -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
    "$url" 2>/dev/null)
  
  if echo "$page" | grep -qiE 'out of stock|sold out|缺货|unavailable|not available|已售罄'; then
    echo "缺货"
  elif echo "$page" | grep -qiE 'order now|add to cart|in stock|available|购买|立刻购买'; then
    echo "有货"
  else
    echo "未知"
  fi
}

# 主监控逻辑
log "=== 开始检查 ==="

# CN2 GIA-E 产品页 (PID=87~93)
PRODUCT_URL="https://bwg6.net/cn2-gia-e/"

# 检查 $49.99/季度 套餐是否有货
STOCK_STATUS=$(check_stock "$PRODUCT_URL" "CN2 GIA-E")

LAST_STATE=""
[ -f "$STATE_FILE" ] && LAST_STATE=$(cat "$STATE_FILE")

log "库存状态: $STOCK_STATUS (上次: $LAST_STATE)"

if [ "$STOCK_STATUS" = "有货" ] && [ "$STOCK_STATUS" != "$LAST_STATE" ]; then
  log "检测到有货！发送通知"
  
  # 发 Telegram
  curl -s "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
    -d "chat_id=$CHAT_ID" \
    -d "text=🎉 搬瓦工 CN2 GIA-E 有货了！

💰 性价比之选：
• 1GB · 2核 · 20GB · 1TB · 2.5Gbps
• $49.99/季度 ($169.99/年)
• 可切换：DC6 / DC9 / 日本软银 / 荷兰 / 加拿大 / 🇸🇬新加坡

👉 购买：https://bwg6.net/cn2-gia-e/

优惠码：BWHNCXNVXV（6.58%折扣）" \
    >> "$LOG" 2>&1
  
  echo "有货" > "$STATE_FILE"
elif [ "$STOCK_STATUS" = "缺货" ]; then
  echo "缺货" > "$STATE_FILE"
fi

log "=== 检查完成 ==="