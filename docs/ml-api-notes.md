# Mercado Libre API 学习笔记

> 学习时间：2026-05-01
> 文档来源：https://global-selling.mercadolibre.com/devsite/zh_cn/

---

## 一、MCP 服务器（模型上下文协议）

**MCP 是什么**：一种开放协议，标准化 AI 模型与数据源/工具之间的连接。

**Mercado Libre MCP 服务器**：
- 地址：`https://mcp.mercadolibre.com/mcp`
- 认证：`Authorization: Bearer <Access_Token>`

### 支持的客户端
Cursor、Windsurf、Cline、Claude Desktop、ChatGPT 等

### 配置示例（Cursor）
```json
{
  "mcpServers": {
    "mercadolibre-mcp-server": {
      "url": "https://mcp.mercadolibre.com/mcp",
      "headers": {
        "Authorization": "Bearer Access_Token"
      }
    }
  }
}
```

### 可用工具
| 工具 | 说明 | 必填参数 |
|------|------|---------|
| `search_documentation` | 在 ML 技术文档中搜索关键字 | query, language |
| `get_documentation_page` | 读取指定文档页面的完整内容 | path, language |

#### search_documentation 参数
- query：搜索关键字
- language：语言（en_us/es_ar/pt_br）
- siteId：站点过滤（可选，MLA/MLB/MLM 等）
- limit：返回数量（可选）
- offset：跳过数量（可选）

#### get_documentation_page 参数
- path：页面路径
- language：语言
- siteId：站点过滤（可选）

> 注意：查询时需说明要查 CBT 文档，否则默认查所有（商城+CBT）

---


---

## 二、授权与令牌最佳实践

### 安全建议（所有 API 调用都应遵守）

1. **获取 token 时用 body 参数，不用 query 参数**
   ```bash
   curl -X POST \
     -H 'accept: application/json' \
     -H 'content-type: application/x-www-form-urlencoded' \
     'https://api.mercadolibre.com/oauth/token' \
     -d 'grant_type=authorization_code' \
     -d 'client_id=$client_id' \
     -d 'client_secret=$client_secret' \
     -d 'code=$code' \
     -d 'redirect_uri=$redirect_uri'
   ```

2. **state 参数防 CSRF**
   授权请求时生成安全随机 ID（state），收到回调时校验：
   ```bash
   curl -X GET \
     https://auth.mercadolibre.com.ar/authorization \
     ?response_type=code \
     &client_id=$APP_ID \
     &state=ABC123 \
     &redirect_uri=$REDIRECT_URL
   # 回调收到 state=ABC123，需校验匹配
   ```

3. **redirect_uri 必须和创建 App 时填的完全一致**

4. **所有 API 请求都必须带 access_token**
   ```bash
   -H "Authorization: Bearer $access_token"
   ```

5. **接收通知前先验证来源**
   - 收到 webhook 时先验证是来自 ML
   - 检查通知中的 URL 是否有效

---


---

## 十九、发布商品

**路径**：`POST https://api.mercadolibre.com/global/items`
**说明**：在多个市场同时发布商品，必填字段：sites_to_sell、category_id、title、price、currency_id、attributes、pictures、available_quantity
**字段**：
- `sites_to_sell`：各市场站点配置，含 site_id、logistic_type、title
- `sites_to_sell[].price`：可选，每市场单独定价；不填则用全局 price
- `listing_type_id`：gold_pro（Premium）或 gold_special（Classic）
- `attributes`：必填，含 BRAND、MODEL、GTIN、ITEM_CONDITION 及 PACKAGE_* 尺寸属性
- `variations`：变体，每个变体单独指定 available_quantity
- `net_proceeds`：净收益模式，填期望净收益，系统自动算刊登价格；与 `price` 不可同时用
- title 填写当地语言（如葡语/西语），避免自动翻译；标题禁止提及库存数量

**关键注意事项**：
- 刊登必须用英语创建，价格以 USD 标价
- 每个站点每天上限 10,000 次请求
- 变体属性组合中多余属性超 1 个会报 372 错误
- ANATEL 认证（巴西电子产品必需）、GTIN 校验（不能重复用于其他品牌）
- `net_proceeds` 净收益模式：系统保护净利润，可变成本（运费/佣金）波动时自动调公开价

---

## 二十、验证（错误码参考）

**路径**：`POST https://api.mercadolibre.com/global/items` 发布商品后返回的错误码列表（101-7810）
**说明**：发布刊登时的完整错误码参考，含 warning（系统自动修正）和 error（需修复）两类

**主要错误码**：
| 码 | 类型 | 说明 |
|----|------|------|
| 101 | error | URL-Friendly String，类目 id 迁移（382 warning 自动更正）|
| 109 | error | 价格低于类目最低价；129 超最高值 |
| 126 | error | 类目不允许刊登（listing_allowed=false）|
| 147 | error | attributes 缺少必填属性（含 conditional_required）|
| 173 | error | gold_special 必传图片 |
| 201/204/3703 | error | 图片数量超限/id 不存在/尺寸不足 500px |
| 304 | error | 物流类型无效（logistic_type 取值不对）|
| 369/372 | error | variations 缺少 attribute_combinations 或属性组合不存在 |
| 3250 | error | 品牌需资质认证（ANATEL，发票证品牌授权）|
| 3701/3711/3712 | error | GTIN 已被其他品牌或类目使用 |
| 3707/3708 | error | 描述超字符限制/数字格式错误 |
| 3709 | error | SALE_FORMAT 和 UNITS_PER_PACK 填写冲突 |
| 3710 | error | 阿根廷电压不允许（100-199V 只支持 220V）|
| 3714/7710/7711/7714 | error | 通用编码（GTIN/EAN/UPC/JAN/ISBN）格式错误 |
| 4029 | warning | 用户必须采用 ME2 物流（自动补全）|
| 4210 | error | 标题性别与 GENDER 属性不符 |
| 5002/5012 | error | 价格超最高值/低于最低值 |
| 5141 | error | 标题为空 |
| 7810 | error | GTIN 是类目条件必填项（conditional_required=true）|

**重要注意事项**：
- ANATEL 认证仅限巴西电子产品（手机、路由器等）
- GTIN 不能重复用于不同品牌或类目的刊登
- 阿根廷电压只支持 220V

<!-- 最后更新：2026-05-01 10:35 -->

---

## 二十一、价格参考

**路径**：`GET /marketplace/benchmarks/user/$USER_ID/items` + `GET /marketplace/benchmarks/items/$ITEM_ID/details`
**说明**：基于平台及其他渠道当前价格/销售历史/需求的竞争性定价参考，帮助卖家设定有竞争力的价格

**两个端点**：
- `GET /marketplace/benchmarks/user/$USER_ID/items`：获取某卖家有价格参考的商品列表
- `GET /marketplace/benchmarks/items/$ITEM_ID/details`：查具体商品的参考价格详情

**details 响应字段**：
- status：价格参考状态（no_benchmark_lowest 低于参考 / no_benchmark_ok 等于参考 / with_benchmark_high 高于参考 / with_benchmark_highest 最高）
- current_price：本店当前价格，含 amount（本地货币）和 usd_amount（USD）
- suggested_price：参考价格建议
- estimated_taxes：预估税费
- costs：selling_fees 销售佣金 + shipping_fees 运费
- applicable_suggestion：价格参考是否适用
- percent_difference：当前价格与参考价的百分比差异
- graph[]：相关商品的价格比较信息

**错误码**：
- 403：user 与调用方站点不匹配
- 404：用户无价格建议 / 商品非 CBT / 无价格参考

**注意事项**：
- internal_price 与 catalog 商品的 price_to_win 获胜参考价格相同
- 适合用于定价自动化功能

<!-- 最后更新：2026-05-01 10:37 -->

---

## 二十二、订单管理

**路径**：`GET /marketplace/orders/search` + `GET /marketplace/orders/$ORDER_ID`
**说明**：CBT 多市场统一管理订单，接收通知后通过订单 ID 查询详情

**订单状态**：
- payment_required：待确认付款才显示用户信息
- payment_in_process：付款未入账
- partially_paid：部分付款已入账但金额不足
- paid：付款已入账
- cancelled：订单未完成履约
- invalid：恶意买家判为无效

**搜索过滤器**（重要）：
- buyer / seller.id / order.status / site（MLM/MLB/MLC）
- date_created.from / date_created.to（格式：yyyy-MM-dd / yyyy-MM-ddThh:mm:ss.ms-TZD）
- last_updated.from / last_updated.to
- limit（最大1000）/ offset
- sort：date_asc / date_desc / updated_asc / updated_desc / closed_asc / closed_desc

**注意**：购物车订单要使用 orders[] 中的订单 ID，不要用顶层 id（那是 pack_id，会404）

**订单详情字段**：
- order_items[].item：id / title / seller_sku / parent_item_id
- order_items[].quantity / unit_price / full_unit_price / sale_fee
- payments[]：transaction_amount / total_paid_amount / taxes_amount / shipping_cost / status
- shipping.id：配送 ID，可查物流类型
- tags[]：含 fraud_risk_detected（欺诈嫌疑）的订单必须取消，不要发货

**gross_price 计算**：
- 公式：gross_price = (unit_price + discounts.full) × quantity
- gross_price = 未打折的原始总金额
- unit_price = 折扣后的单价
- 无折扣时 gross_price = unit_price × quantity

**欺诈嫌疑订单处理**：
- 标签含 fraud_risk_detected → 收到后必须取消订单，不发货
- ML 会发 orders_v2 主题通知

**限速**：/orders/search 每分钟最多 100 次请求

**IMEI 要求（哥伦比亚）**：
- MCO1055 品类手机必须提供 IMEI（15位数字）
- POST /marketplace/orders/$ORDER_ID/attributes
- body: {"name": "IMEI", "value": "15位数字"}

**发票获取**：`GET /marketplace/orders/$ORDER_ID/invoice`（海关形式发票）

**错误码**：
- 403：Invalid caller.id / Can not identify the user
- 404：Resource not found / pack_id 查orders 会404
- 451：法律原因用户不可用

<!-- 最后更新：2026-05-01 10:38 -->

---

## 二十三、发货管理

**路径**：`GET /marketplace/shipments/$SHIPMENT_ID`（需 `x-format-new: true`）
**说明**：发货详情、状态、物流类型、买家地址信息

**发货状态（流转）**：pending → handling → ready_to_ship → shipped → delivered / not_delivered / cancelled

**物流模式**：
- me1（ Mercado Envios 模式1）：卖家自有物流，不提供追踪集成，需卖家提供追踪号
- me2（Mercado Envios 模式2）：预付费面单+预定义承运商追踪号，卖家无需处理

**物流类型**（logistic_type）：
- fulfillment（FBM）：Mercado Libre 负责发货，卖家无操作
- drop_off：集散中心提货
- cross_docking：仅限 MLM
- default：自有物流

**其他关键端点**：
- `GET /marketplace/shipments/$SHIPMENT_ID/costs`：发货费用详情，含 discount 折扣
- `GET /marketplace/items/$ITEM_ID/shipping_options/cost`：商品运费
- `GET /marketplace/shipments/$SHIPMENT_ID/labels`：打印面单（PDF），发货状态须为 ready_to_ship；FBM 无法通过公网 API 获取
- `POST /marketplace/shipments/$SHIPMENT_ID/tracking`：上报追踪信息（仅 me1/default 自有物流）
- `POST /marketplace/shipments/$SHIPMENT_ID/tracking/status`：报告发货状态 delivered / not_delivered（最终状态，不可逆）
- `GET /marketplace/shipments/$SHIPMENT_ID/items`：发货商品明细（含变体）
- `GET /marketplace/shipments/$SHIPMENT_ID/lead_time`：配送时效详情（handling/shipping 时间、承诺送达时间）
- `GET /marketplace/shipments/$SHIPMENT_ID/history`：状态历史
- `GET /marketplace/shipments/$SHIPMENT_ID/carrier`：承运商信息

**发货拆分**（/marketplace/shipments/$SHIPMENT_ID/split）：
- 仅适用于 me2 且 logistic_type 为 drop_off 或 cross_docking
- 同一发货只能一次性拆分为两个新包裹（不能多次拆分）
- 原因：FRAGILE / ANOTHER_WAREHOUSE / IRREGULAR_SHAPE / DIMENSIONS_EXCEEDED / OTHER_MOTIVE
- 新包裹中商品总数必须与原发货总数一致
- 拆分后的子包裹 family_pack_id 指向原始包裹；原始包裹 status_detail 变为 "splitted"

**错误码**：
- 400：Invalid shipment id / invalid token / reason 无效
- 403：Invalid caller.id / 不属于该卖家
- 404：shipment not found
- 406： shipment 非 me1/default 配置（追踪信息仅限自有物流）
- 422：发货无法拆分（状态不允许）

<!-- 最后更新：2026-05-01 10:39 -->

---

## 二十四、运费补偿

**说明**：Mercado Libre 物流承运商告知实际尺寸信息 → 重新计算运费 → 向卖家收取差额（运费补偿）

**推荐流程**：
1. 查询发货 costs 中的 `compensations` 数组是否有补偿
2. 有则调用补偿详情端点
3. 对包邮商品另查包邮补偿

**两个端点**：
- `GET /marketplace/shipments/$SHIPMENT_ID/compensation_costs?weight_unit=g&dimensions_unit=cm`：运单补偿详情
- `GET /marketplace/items/$ITEM_ID/shipping_compensation?weight_unit=g&dimensions_unit=cm`：包邮商品补偿

**响应关键字段**：
- dimension_by：谁申报（seller 卖家申报 / meli 官方校验）
- package.declared：卖家申报的 weight/dimensions/volumetric/bucket
- package.validated：ML 校验后的 weight/dimensions/volumetric/bucket（用于计费）
- costs.declared.sender.cost：申报尺寸对应的运费
- costs.validated.sender.cost：校验后运费
- costs.compensation：最终补偿金额（校验后运费 - 申报运费）
- bucket.min/max：运费重量区间（决定基础运费档次）

**错误码**：
- 400：参数无效（weight_unit/dimensions_unit）
- 403：权限不足
- 404：运单不存在 / 无补偿记录 / 商品无校验尺寸
- 422：商品非包邮（shipping_compensation 仅适用包邮商品）

<!-- 最后更新：2026-05-01 10:40 -->

---

## 二十五、售后退货

**路径**：`GET /marketplace/v2/claims/$CLAIM_ID/returns` + `POST /post-purchase/v1/returns/$RETURN_ID/return-review`
**说明**：退货管理、审核、执行退款

**三种退货类型**：
- claim：买家发起投诉产生的退货
- dispute：买卖双方争议产生的退货
- automatic：系统自动处理的退货

**退货状态流转**：
- opened（买家发起）→ shipped（退货已寄出，款被预留）→ delivered / not_delivered → closed / cancelled / failed / expired
- refund_at：退款时间（shipped=买家寄出时退 / delivered=卖家收到3天后退 / n/a=低价商品不生成退货）

**审核端点**：
- `GET /marketplace/v2/claims/$CLAIM_ID/returns`：查退货详情（含 return_id）
- `GET /post-purchase/v1/returns/$RETURN_ID/reviews`：审核详情（仅当 related_entities 含 "reviews" 时可用）
- `POST /post-purchase/v1/returns/$RETURN_ID/return-review`：执行退货审核（统一端点，成功/失败均用此）
  - 空 body → 审核通过（产品按预期到达）
  - 有 body → 失败审核（需附 reason_id）
- `GET /post-purchase/v1/returns/reasons?flow=seller_return_failed&claim_id=$CLAIM_ID`：可用的失败原因列表

**失败审核原因**：
- SRF2：产品到货时已损坏
- SRF3：退货不完整
- SRF4：退回产品与发出不一致
- SRF5：包裹中没有产品
- SRF6：其他问题
- SRF7：尚未收到产品

**审核判断**：
- 从 /claims/$CLAIM_ID 的 players 数组中，找 type=seller 的参与方，检查 available_actions 是否含 return_review_ok / return_review_fail

**退货退款金额查询**：
- `GET /post-purchase/v1/claims/$CLAIM_ID/charges/return-cost?calculate_amount_usd=true`
- 返回 currency_id / amount / amount_usd

**仓库分拣结果**：
- warehouse_review.product_condition：saleable（可二次销售）/ unsaleable / discard（不符，如石头）
- warehouse_review.benefited：true 卖家被补偿 / false 买家获退款

**seller_review 状态**：pending → success（通过）/ failed（不通过）/ claimed（卖家提出异议）
**申诉适用场景**：分拣流程已有决定，卖家对决定提出质疑（区别于无分拣时的卖家自主失败审核）

<!-- 最后更新：2026-05-01 10:41 -->

---

## 二十六、索赔管理

**路径**：`GET /marketplace/v2/claims/$CLAIM_ID` + `GET /marketplace/v2/claims/search` + `GET /marketplace/v2/claims/$CLAIM_ID/detail` + `GET /marketplace/v2/claims/$CLAIM_ID/actions-history`
**说明**：索赔（Claims）管理，4种资源类型：Order / Shipment / Payment / Purchase

**索赔类型**（status）：opened / closed
**索赔子类型**（type）：mediations（买卖调解）/ fulfillment（全程配送）/ ml_case（延迟取消）/ cancel_sale / cancel_purchase / change（换货）/ service

**索赔阶段**（stage）：claim → dispute（有仲裁）→ recontact（已关闭后重新联系）→ stale（PNR）→ none

**索赔原因**（reason_id）：
- PNR（Product Not Received）：未收到商品
- PDD（Product Wrong or Defective）：商品错误/有缺陷
- CS（Canceled Purchase）：购买取消

**Players 角色**：complainant（发起方）/ respondent（被索赔方）/ mediator（仲裁方）

**卖家可用操作**（available_actions）：
- send_message_to_complainant：发消息给买家
- send_message_to_mediator：发消息给仲裁员
- refund：退款
- open_dispute：发起仲裁
- send_potential_shipping：发送发货承诺日期
- add_shipping_evidence：提交发货证据
- allow_return / allow_return_label：生成退货运单
- allow_partial_refund：部分退款（PDD）
- send_tracking_number：发送追踪号
- return_review_ok / return_review_fail：退货审核通过/失败

**resolution 解决方式**（部分）：
- item_returned：商品已退回
- payment_refunded / partial_refunded：全额/部分退款
- product_delivered：代表判决定义
- charged_back：退单
- seller_explained_functions：卖家解释了用途
- respondent_timeout：卖家超时未回应

**索赔搜索端点**：`GET /marketplace/v2/claims/search`
- 参数：status / stage / type / reason_id / resource / resource_id / order_id / pack_id / user_id / player_user_id / site_id / date_created / last_updated / limit / offset / sort / range (field):after/before

**索赔原因详情**：`GET /marketplace/v2/claims/reasons/$REASON_ID?flow=mediations_delivered&delivered=true`
- flow 参数：cancel_sale / fulfillment_delivered / fulfillment_undelivered / mediations / mediations_delivered / mediations_undelivered / returns 等
- delivered：true=已交付（PDD）/ false=未交付（PNR）

**操作历史**：`GET /marketplace/v2/claims/$CLAIM_ID/actions-history`
- 返回 action_name / player_role / claim_stage / claim_status / date_created

**重要**：从 2025年5月5日 起，v1 版本停用，统一用 v2

<!-- 最后更新：2026-05-01 10:43 -->

---

## 二十七、索赔解决方案

**路径**：`GET /marketplace/v2/claims/$CLAIM_ID/expected-resolutions` + `POST /marketplace/v2/claims/$CLAIM_ID/expected-resolutions/...`
**说明**：索赔的预期解决、部分退款、全额退款、接受退货、发起调解

**预期解决方案类型**：
- refund：退款（PNR）
- product：商品送达（PNR）
- return_product：退货+退款（PDD）
- partial_refund：部分退款（PDD）
- change_product：换货（PDD）

**索赔类型判断**：看 reason_id 前三位字母
- PNRxxxx → 已付款未收到商品
- PDDxxxx → 商品有缺陷/错误

**查询可用退款金额**：
`GET /marketplace/v2/claims/$CLAIM_ID/partial-refund/available-offers`
- 返回 currency_id + available_offers[]（amount + percentage）
- 默认 50%，只能选返回的百分比（10%/20%/30%...90%）
- 不接受部分退款时，买家可升级为争议

**执行部分退款**：
`POST /marketplace/v2/claims/$CLAIM_ID/expected-resolutions/partial-refund`
- body: {"percentage": 50}
- 执行后 expected_resolution 变为 partial_refund，player_role 变为 respondent（买家）
- 不允许 100%（全额用 refund 端点）

**执行全额退款**：
`POST /marketplace/v2/claims/$CLAIM_ID/expected-resolutions/refund`

**接受退货**（新增，端点统一）：
`POST /marketplace/v2/claims/$CLAIM_ID/expected-resolutions/allow-return`
- 取代旧的"接受解决方案"流程
- PDD + Mercado Envíos 发货 + 状态 delivered → 为买家生成退货运单
- 退货状态更新为 shipped/delivered 后，款项自动退还

**发起调解/仲裁**：
`POST /marketplace/v2/claims/$CLAIM_ID/actions/open-dispute`
- 将 stage 从 claim 升为 dispute
- 调解期间发消息需设置 receiver_role=mediator（通过平台集中沟通，不直接联系买家）

**错误码**：
- 400：百分比无效（非 available-offers 返回的值）/ allow_partial_refund 不可用
- 403：token 权限不足
- 404：索赔不存在

<!-- 最后更新：2026-05-01 10:44 -->

---

## 二十八、商品刊登质量

**路径**：`GET /item/$ITEM_ID/performance`
**说明**：取代已停用的 /health API，查看商品刊登质量得分和建议
**重要**：CBT 商品不支持此端点，仅支持本地站点商品

**质量等级**：
| 站点 | 差 | 一般 | 好 |
|-----|-----|------|-----|
| MLB | Básica | Satisfatória | Profissional |
| MLA | Básica | Estándar | Profesional |
| CBT | Basic | Standard | Professional |
| 其他 | Básica | Estándar | Profesional |

**响应结构**：
- score：0-100 分
- level：Bad / Average / Good
- level_wording：本地化名称
- buckets[]：分组质量指标，含 CHARACTERISTICS（产品数据）和 OFFER（销售条件）
- variables[]：具体指标（GTIN / PICTURES / TITLE / FREE_SHIPPING 等）
- rules[]：具体校验规则，含 progress（0-1）、link（修改链接）、mode（OPPORTUNITY=机会/WARNING=警告）

**常见 Variable / Rule**：
- GTIN → HAS_GTIN：通用产品码
- PICTURES → PICTURES_QUANTITY_MIN：图片数量（最少3张）
- TITLE：标题质量
- FREE_SHIPPING → HAS_FREE_SHIPPING：包邮

**错误码**：
- 400：格式错误 / CBT 商品不支持
- 401：不是商品卖家
- 403：权限不足
- 404：商品无 performance 数据

<!-- 最后更新：2026-05-01 10:45 -->

---

## 二十九、访问量（商品访客统计）

**路径**：`GET /visits/items?ids=$ITEM_ID` + `GET /items/visits` + `GET /items/$ITEM_ID/visits/time_window`
**说明**：获取商品 VIP（商品展示页）访问数据，仅限本地商品，**不支持 CBT 商品**

**三个端点**：
- `GET /visits/items?ids=$ITEM_ID`：过去两年商品总访问量（简单数字）
- `GET /items/visits?ids=$ITEM_ID&date_from=$DATE_FROM&date_to=$DATE_TO`：按日期范围的总访问量（含明细）
- `GET /items/$ITEM_ID/visits/time_window?last=$LAST&unit=day&ending=$YYYY-MM-DD`：按时段（天）分组的访问量明细

**参数**：
- date_from / date_to：查询范围，最大150天
- last：最近N天
- unit：仅支持 day
- ending：样本结束日期（YYYY-MM-DD），默认当前
- 注意：ids 参数只支持单个商品（maximum amount of items to query is 1）

**数据特性**：
- 访问以每天唯一访问计数
- 访问量在 48 小时内可用
- 最多可查询 150 天历史

**错误码**：
- 400：Invalid Site ID（CBT 不支持）/ date 格式错误 / 时间范围超150天 / 一次查多个商品 / 商品 ID 格式错误
- 403：token 无效/过期
- 404：商品不存在

<!-- 最后更新：2026-05-01 10:47 -->

---

## 三十、通信公告

**路径**：`GET /communications/notices?limit=20&offset=0`
**说明**：获取 Mercado Libre 发给卖家的所有通信（新闻/警报/发布/培训/广告）

**重要**：
- 通信按创建日期降序排列，只显示查询时仍有效的
- 用卖家 access_token 查卖家通信；用应用所有者 token 查集成商通信

**响应字段**：
- results[].id / label / description / highlighted（是否突出显示）
- results[].from_date：创建时间
- results[].tags[]：tag + type（识别通信类型）
- results[].actions[]：text + link（操作按钮）
- results[].dismiss_key：可用来忽略该通信

**Tag 类型分类**：
- ALERT（警报）：Blocking / Requirement / Restriction / Warning
- NEW（新闻）：Operational contingency / Pre-moderation notice / Business rule change / Other
- RELEASE（发布）：New product / Existing product improvement / Other
- OPPORTUNITY（培训活动）
- PUBLICITY / MODAL

**Tag 分类维度**：
- Attention（客服）：METRICS / CANCELLATIONS / RETURNS
- Shipping（物流）：SHIPPING_GENERIC / SHIPPING / FLEX / FULL / SHIPPING_CARRIER
- Events：BLACK_FRIDAY / HOT_SALE / CYBER_MONDAY / COVID
- Billing：COSTS / BILLING / TRANSMITTER
- Sites：MLM / MLB / MLA / MCO 等
- Publications：PUBLICATIONS / PROMOTIONS_CENTRAL / CATALOG

**错误码**：
- 400：limit/offset 必须为正整数

<!-- 最后更新：2026-05-01 10:48 -->

---

## 三十一、购物体验

**路径**：`GET /marketplace/items/$ITEM_ID/purchase_experience`
**说明**：算法根据客服指标（投诉/取消）对商品排序，帮助卖家发现问题和改进；适用国家：阿根廷/巴西/乌拉圭/墨西哥/哥伦比亚/智利

**重要**：是 /health（刊登质量）之外的另一套评级体系

**冻结类型**（freeze.text，因商业协议/声誉benefits 商品暂不受罚）：
- req_commercial：商业协议冻结
- internal_recovery_grntee：声誉保护冻结
- internal_recovery：浅绿保护冻结
- internal_newbie_grntee：新卖家保护冻结
- grace_time / internal_reputation / req_legal / frozen：其他冻结

**状态**（status.id）：active / paused / moderated
**状态分配来源**（assigned_by）：reputation / other

**Reputation 颜色**：gray（数据不足） / green（好） / yellow / orange / red
**Reputation 值**：-1=数据不足无法计算

**问题分类**（problems）：
- 一级 key：PRODUCT / SHIPPING
- level_two：DIFFERENT_FROM_REQUESTED 等
- level_three：QUALITY_ISSUES 等，含 remedy.text 解决方案
- cancellations / claims：取消/投诉次数

**Distribution**：统计180天窗口内问题分布

**错误码**：
- 400：CBT 商品无站点商品
- 403：无法识别用户（需提供 Seller_ID/Merchant_ID）
- 404：商品不存在

<!-- 最后更新：2026-05-01 10:49 -->
