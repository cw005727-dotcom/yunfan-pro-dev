#!/usr/bin/env python3
"""
记忆向量库建立脚本
将 memory/ 目录下的所有 .md 文件分块 → 向量化 → 存入 ChromaDB

用法:
  python3 scripts/memory/embed_memories.py          # 全量建立
  python3 scripts/memory/embed_memories.py --date 2026-05-13  # 只处理指定日期
"""

import os, re, sys, json
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

import chromadb
from sentence_transformers import SentenceTransformer

# ── 配置 ──────────────────────────────────────────────
WORKSPACE = Path("/Users/chensan/.openclaw/workspace")
MEMORY_DIR = WORKSPACE / "memory"
CHROMA_DIR = WORKSPACE / "memory" / "chroma_db"
CHROMA_COLLECTION = "workspace_memory"

# 向量模型（轻量款，Mac CPU 能跑）
MODEL_NAME = "all-MiniLM-L6-v2"

# 跳过非内容文件
SKIP_FILES = {"README.md", "heartbeat-state.json"}
SKIP_DIRS  = {"chroma_db", ".dreams", "snapshots", ".trash"}
# ──────────────────────────────────────────────────────


def chunk_text(text: str, max_chars: int = 600) -> List[str]:
    """按段落分块，大小约 max_chars 字"""
    paragraphs = re.split(r"\n(?=#|\Z)", text.strip())
    chunks, buf = [], ""
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if len(buf) + len(p) <= max_chars:
            buf += "\n" + p
        else:
            if buf:
                chunks.append(buf.strip())
            buf = p
    if buf:
        chunks.append(buf.strip())
    return chunks


def extract_frontmatter(content: str) -> Tuple[str, dict]:
    """分离 yaml frontmatter 和正文"""
    match = re.match(r"^---\n(.*?)\n---\n", content, re.DOTALL)
    meta = {}
    if match:
        for line in match.group(1).split("\n"):
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        content = content[match.end():]
    return content, meta


def scan_memory_files(date: str = None) -> List[Path]:
    """扫描 memory/ 下所有 .md 文件（排除目录黑名单）"""
    files = []
    for p in MEMORY_DIR.rglob("*.md"):
        # 排除子目录
        rel = p.relative_to(MEMORY_DIR)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        if p.name in SKIP_FILES:
            continue
        if date and not p.stem.startswith(date):
            continue
        files.append(p)
    return sorted(files)


def load_and_chunk(path: Path) -> List[dict]:
    """读取文件，返回 chunks 列表，每块含 text/metadata"""
    raw = path.read_text(encoding="utf-8")
    body, fm = extract_frontmatter(raw)

    # 去除 markdown 语法噪音
    body = re.sub(r"```[\s\S]*?```", "", body)  # 代码块
    body = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", body)  # 链接文字
    body = re.sub(r"#+ ", "", body)  # 标题符号

    chunks = chunk_text(body)
    date_str = path.stem[:10] if len(path.stem) >= 10 else path.stem

    return [
        {
            "text": c,
            "metadata": {
                "file": str(path),
                "date": date_str,
                "topic": path.stem,
            }
        }
        for c in chunks
    ]


def embed_and_store(chunks: List[dict], model, client, collection):
    """向量化并写入 ChromaDB"""
    texts  = [c["text"] for c in chunks]
    metas  = [c["metadata"] for c in chunks]
    ids    = [f"{metas[i]['date']}_{i}_{hash(texts[i]) % 99999:05d}"
              for i in range(len(texts))]

    embeddings = model.encode(texts, show_progress_bar=True).tolist()
    collection.add(
        ids=ids,
        documents=texts,
        metadatas=metas,
        embeddings=embeddings,
    )
    print(f"  → 写入 {len(texts)} 条向量 (ChromaDB)")


def rebuild_collection(force: bool = False):
    """全量重建向量库"""
    collection_path = CHROMA_DIR
    if force and collection_path.exists():
        import shutil
        shutil.rmtree(collection_path)

    collection_path.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(str(collection_path))

    try:
        col = client.get_collection(CHROMA_COLLECTION)
        col.delete()
        print(f"[{CHROMA_COLLECTION}] 已清空旧数据")
    except Exception:
        pass

    col = client.create_collection(
        CHROMA_COLLECTION,
        metadata={"description": "OpenClaw workspace memory 向量库"}
    )

    model = SentenceTransformer(MODEL_NAME)
    print(f"模型加载: {MODEL_NAME}")

    # 只处理主 memory/ 目录 + 子目录
    for md_file in scan_memory_files():
        print(f"处理: {md_file.relative_to(MEMORY_DIR)}")
        chunks = load_and_chunk(md_file)
        if chunks:
            embed_and_store(chunks, model, client, col)

    count = col.count()
    print(f"\n✅ 向量库建立完成，共 {count} 条记录")
    return count


def query_memory(query: str, top_k: int = 5) -> List[dict]:
    """查询最相关的记忆片段"""
    client = chromadb.PersistentClient(str(CHROMA_DIR))
    try:
        col = client.get_collection(CHROMA_COLLECTION)
    except Exception:
        return []

    model = SentenceTransformer(MODEL_NAME)
    emb   = model.encode([query]).tolist()
    results = col.query(
        query_embeddings=emb,
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    out = []
    for i in range(len(results["documents"][0])):
        out.append({
            "text":    results["documents"][0][i],
            "date":    results["metadatas"][0][i].get("date", ""),
            "topic":   results["metadatas"][0][i].get("topic", ""),
            "file":    results["metadatas"][0][i].get("file", ""),
            "distance": round(results["distances"][0][i], 3),
        })
    return out


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", help="只处理指定日期文件，如 2026-05-13")
    parser.add_argument("--force", action="store_true", help="强制重建")
    parser.add_argument("--query", help="查询模式，输入查询文本")
    args = parser.parse_args()

    if args.query:
        results = query_memory(args.query)
        print(f"找到 {len(results)} 条相关记忆:\n")
        for r in results:
            print(f"[{r['date']}] {r['topic']}  (distance={r['distance']})")
            print(f"  {r['text'][:200]}...")
            print()
    else:
        rebuild_collection(force=args.force)