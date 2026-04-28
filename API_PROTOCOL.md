# 云帆跨境 PRO - API 接入协议文档 (v1.1)

本文档定义了前端 UI 与后端数据中枢的交互规范。

## 1. 基础信息

- **Base URL**: `http://localhost:8506`
- **鉴权方式**: 必须在 Header 中携带 `X-Admin-Token: YUNFAN_ADMIN_2026` 或 `Authorization: Bearer YUNFAN_ADMIN_2026`。
- **公共资源**: `index.html` 及静态资源无需鉴权。

## 2. 端点清单 (21 个)

### 2.1 经营概览 (Business Overview)
1. **`GET /api/stats_overview`**: 获取 GMV、销量、回款等核心指标及趋势。
2. **`GET /api/stats`**: (简版) 获取总 GMV 和订单数。
3. **`GET /api/conversion_stats`**: 获取曝光、加购及转化率分析。

### 2.2 订单与物流 (Orders & Logistics)
4. **`GET /api/orders`**: 获取订单列表明细。参数: `site` (可选)。
5. **`GET /api/logistics_alerts`**: 获取物流异常及待处理提醒。

### 2.3 店铺与声誉 (Stores & Reputation)
6. **`GET /api/shop_reputation`**: 获取多店声誉矩阵（投诉、延迟、取消率）。
7. **`GET /api/shops`**: 获取当前已绑定的店铺昵称列表。

### 2.4 市场情报 (Market Intelligence)
8. **`GET /api/market_radar`**: 扫描市场热销商品及高清原图。
9. **`GET /api/trends`**: 获取站点实时热搜词（来自 ML 官方）。
10. **`GET /api/keyword_intelligence`**: AI 分析的关键词热度与蓝海缺口。
11. **`GET /api/ai/keywords`**: (别名) 同上。

### 2.5 选品与优化 (Product Selection & Optimization)
12. **`GET /api/product_metrics`**: 获取商品详细运营指标（曝光/加购/健康分）。
13. **`GET /api/product_performance`**: 商品表现排行。
14. **`GET /api/smart_rotation`**: 智能换新建议（淘汰低效商品，引入潜力品）。
15. **`POST /api/apply_rotation`**: 执行换新操作。Body: `{ "remove_id": "...", "add_id": "..." }`。

### 2.6 AI 工具集 (AI Tools)
16. **`POST /api/listing_doctor`**: 爆品诊断与标题建议。Body: `{ "my_item": {...}, "comp_item": {...} }`。
17. **`POST /api/chat_assistant`**: 智能客服助理。Body: `{ "message": "...", "history": [...] }`。
18. **`POST /api/ai/optimize-title`**: 单纯标题优化。
19. **`POST /api/ai/generate-images`**: (规划中) 视觉实验室生图。

### 2.7 授权与系统 (System & Auth)
20. **`POST /api/generate_auth_url`**: 生成 Mercado Libre 授权链接。
21. **`GET /api/meli-auth`**: 授权回调处理（接收 `code`）。

---
*文档维护者: Data Agent (美客多数据获取)*
