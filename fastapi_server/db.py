"""FastAPI 数据库连接封装
使用 sqlite3 + FastAPI 的依赖注入
"""
import os
import fcntl
import sqlite3
import tempfile
from contextlib import contextmanager
from functools import lru_cache

from .config import DB_PATH

_LOCK_DIR = tempfile.gettempdir()
_STORE_LOCK = os.path.join(_LOCK_DIR, 'yunfan_pro_store.lock')

def _acquire_lock():
    lock_fd = open(_STORE_LOCK, 'w')
    fcntl.flock(lock_fd.fileno(), fcntl.LOCK_EX)
    return lock_fd

def _release_lock(lock_fd):
    fcntl.flock(lock_fd.fileno(), fcntl.LOCK_UN)
    lock_fd.close()

def get_db():
    """FastAPI 依赖注入用的数据库连接（只读查询，加共享锁）"""
    lock_fd = _acquire_lock()
    conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=30)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
        _release_lock(lock_fd)

@lru_cache()
def get_db_path():
    """返回数据库路径，供非 FastAPI 上下文使用"""
    return DB_PATH

@contextmanager
def get_db_connection():
    """上下文管理器，用于 FastAPI 外部（如后台任务），带文件锁防止并发锁冲突"""
    lock_fd = _acquire_lock()
    conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=30)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
        _release_lock(lock_fd)
