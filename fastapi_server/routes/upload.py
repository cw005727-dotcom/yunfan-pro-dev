"""
文件上传路由
"""
import os
import uuid
import asyncio
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from ..config import UPLOAD_DIR

router = APIRouter(prefix="/api", tags=["上传"])

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename")
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / filename
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 20MB)")
    await asyncio.to_thread(lambda f=filepath, d=content: open(f, 'wb').write(d))
    return {"url": f"/uploads/{filename}", "filename": filename}

@router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    filepath = UPLOAD_DIR / filename
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)