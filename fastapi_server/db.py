"""
FastAPI 数据库连接封装
使用 sqlite3 + FastAPI 的依赖注入
"""
import sqlite3
from contextlib import contextmanager
from functools import lru_cache
from fastapi import Depends

from .config import DB_PATH


def get_db():
    """FastAPI 依赖注入用的数据库连接"""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


@lru_cache()
def get_db_path():
    """返回数据库路径，供非 FastAPI 上下文使用"""
    return DB_PATH


@contextmanager
def get_db_connection():
    """上下文管理器，用于 FastAPI 外部（如后台任务）"""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
