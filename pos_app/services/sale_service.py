from typing import Dict, List, Tuple
import sqlite3
from ..repositories.product_repo import ProductRepository
from ..repositories.sale_repo import SaleRepository


class SaleService:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn
        self.products = ProductRepository(conn)
        self.sales = SaleRepository(conn)

    def record_cash_sale(self, sku_to_qty: Dict[str, int]) -> int:
        if not sku_to_qty:
            raise ValueError("No items provided for sale")

        # Fetch products and validate stock
        items: List[Tuple[int, int, float, float]] = []
        for sku, qty in sku_to_qty.items():
            if qty <= 0:
                raise ValueError(f"Quantity must be positive for SKU {sku}")
            product = self.products.get_by_sku(sku)
            if product is None:
                raise ValueError(f"Product with SKU {sku} not found")
            if product.stock_qty < qty:
                raise ValueError(
                    f"Insufficient stock for {product.name} (SKU {sku}). Available: {product.stock_qty}, requested: {qty}"
                )
            items.append((product.id or 0, qty, product.sale_price, product.cost_price))

        # Create sale, reduce stock atomically
        sale_id = self.sales.create_sale(items)
        return sale_id