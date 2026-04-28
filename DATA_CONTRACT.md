# 云帆跨境 PRO - 数据与 UI 契约 (DATA_CONTRACT.md)

> **版本**：1.1.0 (2026-04-28)
> **状态**：已根据 Data Side 反馈修正缺失字段

## 1. 核心原则
- **UI 侧定义规范**：UI 侧根据业务需求定义数据结构，数据侧负责按需提供。
- **字段稳定性**：一旦确定的字段名，严禁在后端私自修改。
- **单一职责**：数据侧 (用户) 负责 `api_server.py` 的接口实现、数据库维护及同步脚本；UI 侧 (我) 负责前端视图、Hooks 及组件交互。

## 2. 店铺声誉接口规范 (`/api/shop_reputation`)

### 返回数据示例 (JSON List)
```json
{
  "id": 6,
  "account": "Nickname",
  "site": "MX",
  "site_id": "MLM",
  "group_label": "大姐店",
  "reputation_level": "1_red",
  "status": "red",
  "is_suspended": false,
  "alert_date": "4.27",
  "claims_history": "Healthy",
  "reclamos": "7.14%",
  "despacho": "30.00%",
  "cancel": "14.28%",
  "new_claims": 1,
  "total_claims": 12,
  "new_violations": 1,
  "total_violations": 3,
  "new_messages": 5,
  "total_messages": 45,
  "new_delayed": 2,
  "new_cancel": 0,
  "total_v": 14,
  "score": 15
}
```

### 字段说明与 UI 处理逻辑
| 字段 | 类型 | UI 用途 | 处理逻辑 |
| :--- | :--- | :--- | :--- |
| `status` | string | 矩阵点颜色 | 接受 `green`, `yellow`, `red`。UI 直接驱动矩阵脉冲效果。 |
| `reputation_level`| string| 官方等级 | 原始级别（如 "1_red", "suspended"）。 |
| `is_suspended` | bool | 封禁标识 | 若为 `true`，详情卡片显示“账号已暂停”红色标签。 |
| `alert_date` | string | 预警日期 | 用于跑马灯显示（如 "4.27"）。 |
| `claims_history` | string | 历史趋势 | 用于详情页显示历史评价（如 "Healthy"）。 |
| `new_violations` | int | 今日违规数 | 跑马灯显示（违规 +N）。 |
| `new_messages` | int | 今日消息数 | 消息卡片显示 (+N)。 |
| `new_delayed` | int | 实时风险预警 | **核心逻辑**：若 `new_delayed > 0`，UI 将在延迟率卡片显示警告。 |

## 3. 实时日志接口规范 (`/api/monitoring_logs`)
- **接口路径**：`/api/monitoring_logs?limit=20`
- **字段要求**：`timestamp`, `level` (info/warning/error), `site_id`, `message`。

## 4. 脚本与所有权 (Ownership)
以下脚本已存在于 `/Users/chensan/yunfan-pro-dev/`，现正式移交给 **Data Side (用户)** 维护：
- `monitor_worker.py`: 负责实时扫描指标并生成 `monitoring_logs`。
- `pull_real_orders.py`: 负责拉取最新真实订单并更新统计。
- `api_server.py`: 负责按照本契约输出 JSON。

---

## 5. 协作流程
1. **变更确认**：如果 UI 需要新字段，由我更新此文档 v1.x；你确认后在 `api_server.py` 实现。
2. **错误处理**：如果接口返回 500 或字段缺失，UI 会显示兜底状态（如 "N/A"），不引发白屏。
