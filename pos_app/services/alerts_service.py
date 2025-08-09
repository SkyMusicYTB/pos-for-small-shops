from typing import List
import sqlite3
from ..models import Product
from ..repositories.product_repo import ProductRepository


class AlertsService:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self.products = ProductRepository(conn)

    def low_stock(self) -> List[Product]:
        return self.products.low_stock_items()