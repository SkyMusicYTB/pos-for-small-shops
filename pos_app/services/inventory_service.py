from typing import List, Optional
import sqlite3
from ..models import Product
from ..repositories.product_repo import ProductRepository


class InventoryService:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self.repo = ProductRepository(conn)

    def add_product(
        self,
        name: str,
        sku: str,
        cost_price: float,
        sale_price: float,
        stock_qty: int,
        low_stock_threshold: int,
    ) -> int:
        product = Product(
            id=None,
            name=name,
            sku=sku,
            cost_price=cost_price,
            sale_price=sale_price,
            stock_qty=stock_qty,
            low_stock_threshold=low_stock_threshold,
        )
        return self.repo.create(product)

    def edit_product(
        self,
        sku: str,
        name: Optional[str] = None,
        cost_price: Optional[float] = None,
        sale_price: Optional[float] = None,
        stock_qty: Optional[int] = None,
        low_stock_threshold: Optional[int] = None,
    ) -> bool:
        return self.repo.update_by_sku(
            sku=sku,
            name=name,
            cost_price=cost_price,
            sale_price=sale_price,
            stock_qty=stock_qty,
            low_stock_threshold=low_stock_threshold,
        )

    def remove_product(self, sku: str) -> bool:
        return self.repo.delete_by_sku(sku)

    def list_products(self) -> List[Product]:
        return self.repo.list_all()

    def get_by_sku(self, sku: str) -> Optional[Product]:
        return self.repo.get_by_sku(sku)

    def low_stock_items(self) -> List[Product]:
        return self.repo.low_stock_items()