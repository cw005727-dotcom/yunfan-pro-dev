#!/usr/bin/env python3
"""
session_cleanup.py - 清理超过3天的会话文件，保留关键内容到 memory 日记

运行方式:
  python3 ~/yunfan-pro-dev/scripts/cron/session_cleanup.py

Cron 示例（每天凌晨3点）:
  0 3 * * * /usr/bin/python3 ~/yunfan-pro-dev/scripts/cron/session_cleanup.py >> ~/yunfan-pro-dev/logs/session_cleanup.log 2>&1
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict
from typing import Optional, List, Dict

OPENCLAW_STATE_DIR = os.environ.get("OPENCLAW_STATE_DIR", os.path.expanduser("~/.openclaw"))
AGENT_ID = "main"
SESSION_DIR = Path(OPENCLAW_STATE_DIR) / "agents" / AGENT_ID / "sessions"
WORKSPACE_DIR = Path(os.environ.get("OPENCLAW_WORKSPACE", os.path.expanduser("~/.openclaw/workspace")))
MEMORY_DIR = WORKSPACE_DIR / "memory"
RETENTION_DAYS = 3


def get_session_date(session_path: Path) -> Optional[str]:
    """从 session 文件第一行读取 timestamp，返回 YYYY-MM-DD"""
    try:
        with open(session_path, "r", encoding="utf-8") as f:
            first_line = f.readline()
            if not first_line:
                return None
            obj = json.loads(first_line)
            ts = obj.get("timestamp", "")
            if ts:
                return ts[:10]
    except Exception:
        pass
    return None


def extract_messages(session_path: Path) -> List[Dict]:
    """提取 session 中所有消息"""
    messages = []
    try:
        with open(session_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if obj.get("type") == "message":
                    msg = obj.get("message", {})
                    role = msg.get("role", "")
                    if role in ("user", "assistant"):
                        content_list = msg.get("content", [])
                        texts = []
                        for block in content_list:
                            if isinstance(block, dict) and block.get("type") == "text":
                                texts.append(block.get("text", ""))
                            elif isinstance(block, str):
                                texts.append(block)
                        if texts:
                            messages.append({
                                "role": role,
                                "text": "\n".join(texts[:3])  # 限制每个 block 长度
                            })
    except Exception as e:
        print(f"  [WARN] 读取失败 {session_path.name}: {e}", file=sys.stderr)
    return messages


def summarize_session(messages: List[Dict], date: str) -> str:
    """生成 session 摘要"""
    if not messages:
        return ""

    lines = [f"## {date} 会话摘要", ""]

    user_msgs = [m["text"] for m in messages if m["role"] == "user"]
    assistant_msgs = [m["text"] for m in messages if m["role"] == "assistant"]

    # 提取用户提问主题
    if user_msgs:
        first_topic = user_msgs[0][:100].replace("\n", " ")
        lines.append(f"- 话题：{first_topic}{'...' if len(first_topic) >= 100 else ''}")

    # 关键结论
    if assistant_msgs:
        # 取 assistant 最后一条消息的最后200字（通常是总结）
        last_summary = assistant_msgs[-1][-200:].replace("\n", " ")
        if last_summary:
            lines.append(f"- 结论：{last_summary}")

    # 用户最后一条消息（反映最终意图）
    if len(user_msgs) > 1:
        last_user = user_msgs[-1][:100].replace("\n", " ")
        lines.append(f"- 后续：{last_user}{'...' if len(last_user) >= 100 else ''}")

    lines.append("")
    return "\n".join(lines)


def get_memory_file(date: str) -> Path:
    """获取或创建当天的 memory 文件"""
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    path = MEMORY_DIR / f"{date}.md"
    if not path.exists():
        path.write_text(f"# {date} 日记\n\n", encoding="utf-8")
    return path


def append_to_memory(memory_path: Path, content: str):
    """追加内容到 memory 文件"""
    with open(memory_path, "a", encoding="utf-8") as f:
        f.write(content + "\n")


def delete_session_files(session_id: str):
    """删除 session 相关文件"""
    base = SESSION_DIR / session_id

    to_delete = [
        base.with_suffix(".jsonl"),                          # 主文件
        base.parent / f"{session_id}.trajectory.jsonl",    # trajectory
    ]

    # checkpoint 文件（通配符匹配）
    checkpoint_pattern = f"{session_id}.checkpoint.*.jsonl"
    to_delete += list(SESSION_DIR.glob(checkpoint_pattern))

    # 旧格式带时间戳前缀的
    for f in SESSION_DIR.glob(f"*{session_id}*.jsonl"):
        to_delete.append(f)

    for fp in to_delete:
        if fp.exists():
            try:
                fp.unlink()
                print(f"  删除: {fp.name}")
            except Exception as e:
                print(f"  [WARN] 删除失败 {fp.name}: {e}", file=sys.stderr)


def main():
    cutoff_date = datetime.now() - timedelta(days=RETENTION_DAYS)
    cutoff_str = cutoff_date.strftime("%Y-%m-%d")
    today_str = datetime.now().strftime("%Y-%m-%d")

    print(f"[{datetime.now().isoformat()}] 开始清理 {RETENTION_DAYS} 天前（< {cutoff_str}）的会话文件")

    # 按 session_id 分组（主文件 + trajectory + checkpoint）
    sessions: dict[str, list[Path]] = defaultdict(list)
    all_files = list(SESSION_DIR.glob("*.jsonl"))

    for f in all_files:
        name = f.name
        # 解析 session_id
        if ".checkpoint." in name:
            parts = name.split(".checkpoint.")
            session_id = parts[0]
            sessions[session_id].append(f)
        elif name.endswith(".trajectory.jsonl"):
            session_id = name.replace(".trajectory.jsonl", "")
            sessions[session_id].append(f)
        elif ".trajectory.jsonl" in name:
            # 带时间戳前缀的: 2026-05-21T02-30-17-899Z_sessionid.trajectory.jsonl
            session_id = name.split("_")[-1].replace(".trajectory.jsonl", "")
            sessions[session_id].append(f)
        elif ".checkpoint" in name:
            continue  # 已在上面处理
        else:
            # 主文件
            session_id = name.replace(".jsonl", "")
            sessions[session_id].append(f)

    total_deleted = 0
    total_sessions = 0

    for session_id, files in sessions.items():
        # 找主文件判断日期
        main_file = SESSION_DIR / f"{session_id}.jsonl"
        if not main_file.exists():
            # 可能是时间戳前缀格式
            ts_prefix_files = [f for f in files if f.name.startswith("202")]
            if ts_prefix_files:
                main_file = ts_prefix_files[0]

        if not main_file.exists():
            continue

        date_str = get_session_date(main_file)
        if date_str is None:
            print(f"  [WARN] 无法读取日期: {main_file.name}")
            continue

        try:
            session_dt = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            print(f"  [WARN] 日期解析失败: {date_str} ({main_file.name})")
            continue

        if session_dt >= cutoff_date:
            continue  # 未超过3天，跳过

        # 提取消息并生成摘要
        messages = extract_messages(main_file)
        summary = summarize_session(messages, date_str)

        # 写入 memory 文件
        if summary:
            memory_path = get_memory_file(date_str)
            append_to_memory(memory_path, summary)
            print(f"  摘要写入: {memory_path.name}")

        # 删除 session 文件
        print(f"  开始删除 session {session_id[:8]}... (日期: {date_str}):")
        delete_session_files(session_id)
        total_deleted += len(files)
        total_sessions += 1

    print(f"\n清理完成: 删除了 {total_deleted} 个文件（{total_sessions} 个会话）")
    print(f"处理范围: < {cutoff_str}（{RETENTION_DAYS} 天前）")


if __name__ == "__main__":
    main()