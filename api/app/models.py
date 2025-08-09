from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: str
    business_id: str
    email: EmailStr
    role: str
    active: bool


class ProductIn(BaseModel):
    sku: str
    name: str
    category: str
    cost_price: float
    sell_price: float
    tax_rate: Optional[float] = None
    stock_qty: float = 0
    low_stock_threshold: float = 0
    active: bool = True


class ProductOut(ProductIn):
    id: str
    business_id: str
    created_at: datetime


class SaleItemIn(BaseModel):
    product_id: str
    qty: float = Field(gt=0)


class SaleIn(BaseModel):
    items: List[SaleItemIn]
    discount_amount: float = 0


class SaleOut(BaseModel):
    id: str
    subtotal: float
    discount_amount: float
    tax_amount: float
    total: float
    cash_received: float
    change_due: float
    created_at: datetime


class LowStockOut(BaseModel):
    id: str
    sku: str
    name: str
    stock_qty: float
    low_stock_threshold: float


class DashboardKPIs(BaseModel):
    start: datetime
    end: datetime
    total_sales: float
    gross_profit: float
    roi: Optional[float] = None


class DailyZReport(BaseModel):
    business_id: str
    date: str
    total_sales: float
    total_transactions: int