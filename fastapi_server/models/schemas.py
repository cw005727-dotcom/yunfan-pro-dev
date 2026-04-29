"""
Pydantic 数据模型
用于请求验证和响应序列化
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ==================== 店铺/认证 ====================

class Store(BaseModel):
    id: int
    user_id: int
    site_id: str
    nickname: Optional[str] = None
    store_name: Optional[str] = None
    access_token: str
    refresh_token: Optional[str] = None
    group_label: Optional[str] = None
    master_user_id: Optional[int] = None
    reputation_level: Optional[str] = None
    status: str = "green"
    complaints_rate: Optional[str] = None
    delayed_rate: Optional[str] = None
    cancellations_rate: Optional[str] = None
    total_transactions: int = 0
    claims_period_days: Optional[str] = None
    claims_history: Optional[str] = None
    alert_date: Optional[str] = None
    new_claims: int = 0
    new_delayed: int = 0
    new_cancel: int = 0
    total_complaints: int = 0
    total_violations: int = 0
    total_messages: int = 0
    total_cancellations: int = 0
    new_violations: int = 0
    new_messages: int = 0
    last_updated: Optional[str] = None


class AuthUrlResponse(BaseModel):
    url: str
    expires_in: int = 3600


# ==================== 订单 ====================

class Order(BaseModel):
    id: str
    user_id: Optional[int] = None
    site_id: str
    order_date: Optional[str] = None
    product_name: str
    quantity: int = 0
    amount: float = 0.0
    platform_fee: float = 0.0
    tax: float = 0.0
    net_profit: float = 0.0
    last_ship_date: Optional[str] = None
    status: str
    shipping_status: Optional[str] = None
    shipping_substatus: Optional[str] = None
    tracking_id: Optional[str] = None
    logistic_type: Optional[str] = None
    seller_sku: Optional[str] = None
    thumbnail: str = ""
    cancel_detail_group: Optional[str] = None
    mediations_count: int = 0
    paid_amount: float = 0.0
    cancel_code: Optional[str] = None
    logistic_company: Optional[str] = None
    tracking_status: Optional[str] = None
    receiver_city: Optional[str] = None
    receiver_state: Optional[str] = None
    estimated_delivery_date: Optional[str] = None
    weight: float = 0.0


class OrderListResponse(BaseModel):
    orders: List[Order]
    total: int
    page: int = 1
    page_size: int = 50


# ==================== 商品 ====================

class Product(BaseModel):
    item_id: str
    name: str
    exposure: int = 0
    clicks: int = 0
    carts: int = 0
    cart_rate: float = 0.0
    returns: int = 0
    claims: int = 0
    health_score: int = 0
    price_index: float = 0.0
    category_avg_rate: float = 0.0
    image_url: Optional[str] = None
    site_id: str
    last_updated: Optional[str] = None
    price: float = 0.0
    is_core: int = 0
    start_time: Optional[str] = None
    sales: int = 0
    status: str = "active"
    sub_status: Optional[str] = None
    trend_score: float = 0.0
    currency: Optional[str] = None
    logistic_type: Optional[str] = None


class ProductListResponse(BaseModel):
    products: List[Product]
    total: int


# ==================== 统计数据 ====================

class StatsOverview(BaseModel):
    total_orders: int
    total_revenue: float
    total_exposure: int
    total_clicks: int
    total_carts: int
    conversion_rate: float
    period_days: int


class DailyStats(BaseModel):
    date: str
    exposure: int
    clicks: int
    carts: int
    conversion_rate: float


class StatsResponse(BaseModel):
    overview: StatsOverview
    daily: List[DailyStats]


# ==================== 店铺信誉 ====================

class ReputationMetrics(BaseModel):
    complaints_rate: Optional[str] = None
    delayed_rate: Optional[str] = None
    cancellations_rate: Optional[str] = None
    claims_value: int = 0
    delayed_value: int = 0
    cancel_value: int = 0
    total_transactions: int = 0
    claims_period_days: Optional[str] = None
    claims_history: Optional[str] = None


class ShopReputation(BaseModel):
    store: Store
    metrics: ReputationMetrics
    alerts: Optional[dict] = None


# ==================== 物流 ====================

class LogisticsStats(BaseModel):
    total_shipped: int
    total_delivered: int
    total_in_transit: int
    total_pending: int
    avg_delivery_days: float


class LogisticsDetail(BaseModel):
    order_id: str
    tracking_id: Optional[str] = None
    status: str
    logistic_type: Optional[str] = None
    estimated_delivery: Optional[str] = None
    last_update: Optional[str] = None


# ==================== 智能调价 ====================

class RotationRule(BaseModel):
    item_id: str
    strategy: str  # "aggressive", "moderate", "conservative"
    min_price: float
    max_price: float
    target_margin: float
    enabled: bool = True


class RotationApplyRequest(BaseModel):
    rules: List[RotationRule]
    dry_run: bool = True


class RotationApplyResponse(BaseModel):
    applied_count: int
    skipped_count: int
    results: List[dict]


# ==================== 客服消息 ====================

class CustomerMessage(BaseModel):
    id: str
    site_id: str
    seller_id: str
    buyer_id: str
    buyer_name: str
    item_id: Optional[str] = None
    last_message: Optional[str] = None
    status: str  # unread, replied, closed
    updated_at: Optional[str] = None


class ChatMessage(BaseModel):
    id: int
    message_id: str
    role: str  # buyer, seller, ai
    content: str
    translated_content: Optional[str] = None
    created_at: Optional[str] = None


# ==================== 通用响应 ====================

class ApiResponse(BaseModel):
    code: int = 200
    message: str = "success"
    data: Optional[dict] = None


class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int
