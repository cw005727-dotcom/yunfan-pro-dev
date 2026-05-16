#!/usr/bin/env python3
"""
向量记忆查询工具 - 让 AI 拥有语义搜索能力
将 query_memory() 暴露为可调用接口，供 OpenClaw 记忆增强使用

用法（直接调用）:
  python3 scripts/memory/query_memory.py "今天做了什么"
  
API 接口模式（供 FastAPI 调用）:
  GET /api/memory/query?q=关键词
"""

import os, sys
from pathlib import Path

# 环境变量（兼容 HF 镜像）
os.environ.setdefault("HF_ENDPOINT", "https://hf-mirror.com")

WORKSPACE    = Path("/Users/chensan/.openclaw/workspace")
CHROMA_DIR   = WORKSPACE / "memory" / "chroma_db"
COLLECTION   = "workspace_memory"
MODEL_NAME   = "all-MiniLM-L6-v2"

def query_memory(query: str, top_k: int = 5) -> list:
    """查询最相关的记忆片段"""
    import chromadb
    from sentence_transformers import SentenceTransformer

    if not CHROMA_DIR.exists():
        return []

    client = chromadb.PersistentClient(str(CHROMA_DIR))
    try:
        col = client.get_collection(COLLECTION)
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
            "text":     results["documents"][0][i],
            "date":     results["metadatas"][0][i].get("date", ""),
            "topic":    results["metadatas"][0][i].get("topic", ""),
            "distance": round(results["distances"][0][i], 3),
        })
    return out


def format_results(results: list, query: str) -> str:
    """格式化输出"""
    if not results:
        return f"没有找到与「{query}」相关的记忆。"

    lines = [f"找到 {len(results)} 条相关记忆:\n"]
    for r in results:
        conf = "🟡" if r["distance"] < 1.4 else "🔴" if r["distance"] > 1.6 else "🟢"
        lines.append(f"{conf} [{r['date']}] {r['topic']}")
        # 截断太长内容
        text = r["text"]
        if len(text) > 250:
            text = text[:250] + "..."
        lines.append(f"   {text}")
        lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "今天做了什么"
    results = query_memory(query)
    print(format_results(results, query))