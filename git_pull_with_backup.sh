#!/bin/bash
# git_pull_with_backup.sh
# 安全 git pull：拉之前先备份数据库

PROJECT_DIR="/home/admin/yunfan-pro-dev"
DB_FILE="$PROJECT_DIR/mercadolibre.db"
BACKUP_DIR="/tmp"
LOG_DIR="$PROJECT_DIR/logs"

cd "$PROJECT_DIR" || exit 1

# 建 logs 目录（如没有）
mkdir -p "$LOG_DIR"

# 备份数据库（带时间戳）
if [ -f "$DB_FILE" ]; then
    BACKUP_PATH="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).db"
    cp "$DB_FILE" "$BACKUP_PATH"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] DB backup: $BACKUP_PATH" >> "$LOG_DIR/git_backup.log"
    echo "数据库已备份: $BACKUP_PATH"
fi

# 执行 git pull
echo "执行 git pull..."
cd "$PROJECT_DIR"
git stash
git pull
git stash pop

echo "完成"
echo "如有需要可从 /tmp/backup_*.db 恢复"