#!/bin/bash
# webhook 健康监控 - 每5分钟跑一次
# 检查最近30分钟是否有 webhook 到达
# 没到则告警（写 monitoring_logs + 可选发 Telegram）

PROJECT_ROOT="/Users/chensan/yunfan-pro-dev"
DB="$PROJECT_ROOT/mercadolibre.db"
LOG="$PROJECT_ROOT/webhook_monitor.log"
ALERT_THRESHOLD_MINUTES=30

cd "$PROJECT_ROOT" || exit 1

last_webhook=$(sqlite3 "$DB" "
  SELECT timestamp FROM monitoring_logs 
  WHERE action='webhook' 
  ORDER BY created_at DESC LIMIT 1;
" 2>/dev/null)

# 用当前时间比较
last_ts=$(sqlite3 "$DB" "
  SELECT datetime(timestamp) FROM monitoring_logs 
  WHERE action='webhook' OR action LIKE '%webhook%'
  ORDER BY timestamp DESC LIMIT 1;
" 2>/dev/null)

if [ -z "$last_ts" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ 从未收到过 webhook" >> "$LOG"
  echo "ALERT: no webhook ever received" 
else
  last_epoch=$(date -j -f "%Y-%m-%d %H:%M:%S" "$last_ts" +%s 2>/dev/null || date -d "$last_ts" +%s 2>/dev/null)
  now_epoch=$(date +%s)
  diff_min=$(( (now_epoch - last_epoch) / 60 ))
  
  if [ "$diff_min" -gt "$ALERT_THRESHOLD_MINUTES" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ 超过${diff_min}分钟无 webhook" >> "$LOG"
    echo "ALERT: no webhook for ${diff_min} minutes (last: $last_ts)"
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ webhook 正常（最后: $last_ts，${diff_min}分钟前）" >> "$LOG"
  fi
fi
