from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Product:
    id: Optional[int]
    name: str
    sku: str
    cost_price: float
    sale_price: float
    stock_qty: int
    low_stock_threshold: int


@dataclass
class SaleItem:
    product_id: int
    quantity: int
    unit_price: float
    unit_cost: float


@dataclass
class Sale:
    id: Optional[int]
    total_amount: float
    total_cost: float
    total_profit: float
    items: List[SaleItem]