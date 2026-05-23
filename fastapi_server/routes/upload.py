"""文件上传路由"""
import os
import uuid
import asyncio
import tempfile
import time
import json
import base64
import sqlite3
import openpyxl
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from ..config import UPLOAD_DIR, DB_PATH, DATA_DIR

ACCESS_TOKEN = 'APP_USR-4507485641678982-051506-10e8e94fd7205a8a5acf2a0a5aac7f3e-3164139599'

# 导入解析脚本
import sys
_scripts_path = os.path.join(os.path.dirname(__file__), '..', '..', 'scripts')
sys.path.insert(0, _scripts_path)

router = APIRouter(prefix="/api", tags=["上传"])


@router.post("/upload/orders")
async def upload_orders(file: UploadFile = File(...)):
    """上传订单Excel，解析入库到 operational_orders 表"""
    if not file.filename or not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="仅支持 .xlsx / .xls 文件")

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="文件过大（最大20MB）")

    with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        from upload.parse_orders import parse_and_import as parse_orders_excel
        result = parse_orders_excel(tmp_path, source_file=file.filename)
        if result.get('error'):
            raise HTTPException(status_code=422, detail=result['error'])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析失败: {str(e)}")
    finally:
        os.unlink(tmp_path)


@router.post("/upload/links")
async def upload_links(file: UploadFile = File(...)):
    """上传商品性能Excel，解析入库到 product_performance 表，并拉取图片"""
    import requests

    if not file.filename or not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="仅支持 .xlsx / .xls 文件")

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="文件过大（最大20MB）")

    # 解析 XLSX
    with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        wb = openpyxl.load_workbook(tmp_path)
        ws = wb.active if '报告' not in wb.sheetnames else wb['报告']

        # 找标题行（Row 6）和数据行（Row 7+）
        headers = []
        for row in ws.iter_rows(min_row=6, max_row=6, values_only=True):
            headers = list(row)

        # 字段映射：中文 → 英文
        field_map = {
            '发布 ID': 'item_id', '商品': 'product_name', '当前状态': 'status',
            '变体': 'variation', 'SKU': 'sku', '独立访问量': 'unique_visits',
            '订单数量': 'order_count', '唯一买家': 'unique_buyers',
            '已售件数': 'units_sold', '毛销售额 (USD)': 'gross_sales_usd',
            '占比(%)': 'share_percent', '访客转化率': 'visitor_convert_rate',
            '访客到购买的转化率': 'visitor_buy_convert_rate'
        }

        # 加载 token（本地或服务器路径）
        h = {'Authorization': f'Bearer {ACCESS_TOKEN}'}

        conn = sqlite3.connect(str(DB_PATH))
        imported = 0
        skipped = 0

        for row_idx, row in enumerate(ws.iter_rows(min_row=7, values_only=True), start=7):
            item_id_raw = row[0]  # 发布 ID 在 A 列
            if not item_id_raw or not str(item_id_raw).isdigit():
                continue

            item_id = str(item_id_raw)

            # 构建数据字典
            data = {'item_id': item_id}
            for col_idx, value in enumerate(row):
                header = headers[col_idx] if col_idx < len(headers) else None
                if header and header in field_map:
                    key = field_map[header]
                    data[key] = value

            # 清理数字字段
            for num_field in ['unique_visits', 'order_count', 'unique_buyers', 'units_sold', 'gross_sales_usd']:
                if num_field in data and data[num_field]:
                    val = str(data[num_field]).replace(',', '.').replace('US$', '').strip()
                    try:
                        data[num_field] = float(val) if '.' in val else int(val)
                    except:
                        data[num_field] = 0

            # 拉取图片
            thumbnail = ''
            pictures = '[]'
            pics_count = 0
            try:
                ml_id = f'MLB{item_id}'
                r = requests.get(
                    f'https://api.mercadolibre.com/marketplace/items/{ml_id}',
                    headers=h, timeout=8
                )
                if r.status_code == 200:
                    d = r.json()
                    thumbnail = d.get('thumbnail', '') or d.get('secure_thumbnail', '')
                    pics = d.get('pictures', [])
                    pics_count = len(pics)
                    pics_urls = [p if isinstance(p, str) else p.get('url', '') for p in pics]
                    pictures = json.dumps(pics_urls, ensure_ascii=False)
            except:
                pass

            data['thumbnail'] = thumbnail
            data['pictures'] = pictures
            data['pictures_count'] = pics_count
            data['source_file'] = file.filename

            # 写入数据库（UPSERT）
            try:
                conn.execute("""
                    INSERT INTO product_performance 
                    (item_id, sku, product_name, status, variation, unique_visits, order_count,
                     unique_buyers, units_sold, gross_sales_usd, share_percent, 
                     visitor_convert_rate, visitor_buy_convert_rate, thumbnail, pictures, 
                     pictures_count, source_file, updated_at)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
                    ON CONFLICT(item_id) DO UPDATE SET
                        sku=excluded.sku, product_name=excluded.product_name, status=excluded.status,
                        variation=excluded.variation, unique_visits=excluded.unique_visits,
                        order_count=excluded.order_count, unique_buyers=excluded.unique_buyers,
                        units_sold=excluded.units_sold, gross_sales_usd=excluded.gross_sales_usd,
                        share_percent=excluded.share_percent, visitor_convert_rate=excluded.visitor_convert_rate,
                        visitor_buy_convert_rate=excluded.visitor_buy_convert_rate,
                        thumbnail=excluded.thumbnail, pictures=excluded.pictures,
                        pictures_count=excluded.pictures_count, source_file=excluded.source_file,
                        updated_at=CURRENT_TIMESTAMP
                """, (
                    data.get('item_id'), data.get('sku'), data.get('product_name'),
                    data.get('status', ''), data.get('variation', ''),
                    data.get('unique_visits', 0), data.get('order_count', 0),
                    data.get('unique_buyers', 0), data.get('units_sold', 0),
                    data.get('gross_sales_usd', 0), data.get('share_percent', ''),
                    data.get('visitor_convert_rate', ''), data.get('visitor_buy_convert_rate', ''),
                    thumbnail, pictures, pics_count, file.filename
                ))
                imported += 1
            except Exception as e:
                skipped += 1

            time.sleep(0.3)  # rate limit

        conn.commit()
        conn.close()

        return {
            'success': True,
            'imported': imported,
            'skipped': skipped,
            'message': f'导入成功 {imported} 条，跳过 {skipped} 条'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析失败: {str(e)}")
    finally:
        os.unlink(tmp_path)


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """通用文件上传"""
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