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
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Form
from fastapi.responses import FileResponse
from ..config import UPLOAD_DIR, DB_PATH, DATA_DIR, TOKEN_FILE_ENC, TOKEN_FILE_JSON

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
async def upload_links(file: UploadFile = File(...), site_id: str = Form(None)):
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
        tokens = None
        for _token_file in [TOKEN_FILE_ENC, '/home/admin/data/ml_tokens.enc']:
            if os.path.exists(_token_file):
                for _key_file in [TOKEN_FILE_JSON, '/home/admin/.ml_token_key']:
                    if os.path.exists(_key_file):
                        try:
                            key = open(_key_file).read().strip()
                            enc = open(_token_file).read()
                            data_bytes = base64.b64decode(enc.encode())
                            result = bytearray()
                            for i in range(len(data_bytes)):
                                result.append(data_bytes[i] ^ key.encode()[i % len(key)])
                            tokens = json.loads(result.decode())
                            break
                        except:
                            continue
            if tokens:
                break

        at = tokens.get('access_token', '') if tokens else ''
        h = {'Authorization': f'Bearer {at}'}

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
            data['site_id'] = site_id or 'MLB'

            # 写入数据库（UPSERT）
            try:
                conn.execute("""
                    INSERT INTO product_performance 
                    (item_id, sku, product_name, status, variation, unique_visits, order_count,
                     unique_buyers, units_sold, gross_sales_usd, share_percent, 
                     visitor_convert_rate, visitor_buy_convert_rate, thumbnail, pictures, 
                     pictures_count, source_file, site_id, updated_at)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
                    ON CONFLICT(item_id) DO UPDATE SET
                        sku=excluded.sku, product_name=excluded.product_name, status=excluded.status,
                        variation=excluded.variation, unique_visits=excluded.unique_visits,
                        order_count=excluded.order_count, unique_buyers=excluded.unique_buyers,
                        units_sold=excluded.units_sold, gross_sales_usd=excluded.gross_sales_usd,
                        share_percent=excluded.share_percent, visitor_convert_rate=excluded.visitor_convert_rate,
                        visitor_buy_convert_rate=excluded.visitor_buy_convert_rate,
                        thumbnail=excluded.thumbnail, pictures=excluded.pictures,
                        pictures_count=excluded.pictures_count, source_file=excluded.source_file,
                        site_id=excluded.site_id, updated_at=CURRENT_TIMESTAMP
                """, (
                    data.get('item_id'), data.get('sku'), data.get('product_name'),
                    data.get('status', ''), data.get('variation', ''),
                    data.get('unique_visits', 0), data.get('order_count', 0),
                    data.get('unique_buyers', 0), data.get('units_sold', 0),
                    data.get('gross_sales_usd', 0), data.get('share_percent', ''),
                    data.get('visitor_convert_rate', ''), data.get('visitor_buy_convert_rate', ''),
                    thumbnail, pictures, pics_count, file.filename, site_id or 'MLB'
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


@router.get("/changes")
async def get_changes(order_number: str = None, change_type: str = None, limit: int = 100):
    """查询历史变化记录"""
    import sqlite3
    from ..config import DB_PATH
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_changes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT,
            change_type TEXT,
            old_value TEXT,
            new_value TEXT,
            thumbnail TEXT,
            site TEXT,
            store_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    where = []
    params = []
    if order_number:
        where.append("order_number = ?")
        params.append(order_number)
    if change_type:
        where.append("change_type = ?")
        params.append(change_type)
    sql = "SELECT id, order_number, change_type, old_value, new_value, thumbnail, site, store_name, created_at FROM order_changes"
    if where:
        sql += " WHERE " + " AND ".join(where)
    sql += " ORDER BY id DESC LIMIT ?"
    params.append(limit)
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "order_number": r[1], "change_type": r[2], "old_value": r[3], "new_value": r[4], "thumbnail": r[5], "site": r[6], "store_name": r[7], "created_at": r[8]} for r in rows]