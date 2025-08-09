from typing import List, Optional
import sqlite3
from ..models import Product


class ProductRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn

    def create(self, product: Product) -> int:
        cur = self.conn.execute(
            """
            INSERT INTO products(name, sku, cost_price, sale_price, stock_qty, low_stock_threshold)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                product.name,
                product.sku,
                product.cost_price,
                product.sale_price,
                product.stock_qty,
                product.low_stock_threshold,
            ),
        )
        self.conn.commit()
        return int(cur.lastrowid)

    def update_by_sku(
        self,
        sku: str,
        name: Optional[str] = None,
        cost_price: Optional[float] = None,
        sale_price: Optional[float] = None,
        stock_qty: Optional[int] = None,
        low_stock_threshold: Optional[int] = None,
    ) -> bool:
        fields = []
        values = []
        if name is not None:
            fields.append("name = ?")
            values.append(name)
        if cost_price is not None:
            fields.append("cost_price = ?")
            values.append(cost_price)
        if sale_price is not None:
            fields.append("sale_price = ?")
            values.append(sale_price)
        if stock_qty is not None:
            fields.append("stock_qty = ?")
            values.append(stock_qty)
        if low_stock_threshold is not None:
            fields.append("low_stock_threshold = ?")
            values.append(low_stock_threshold)

        if not fields:
            return False

        values.append(sku)
        cur = self.conn.execute(
            f"UPDATE products SET {', '.join(fields)} WHERE sku = ?",
            tuple(values),
        )
        self.conn.commit()
        return cur.rowcount > 0

    def delete_by_sku(self, sku: str) -> bool:
        cur = self.conn.execute("DELETE FROM products WHERE sku = ?", (sku,))
        self.conn.commit()
        return cur.rowcount > 0

    def get_by_sku(self, sku: str) -> Optional[Product]:
        cur = self.conn.execute(
            "SELECT id, name, sku, cost_price, sale_price, stock_qty, low_stock_threshold FROM products WHERE sku = ?",
            (sku,),
        )
        row = cur.fetchone()
        if not row:
            return None
        return Product(
            id=row["id"],
            name=row["name"],
            sku=row["sku"],
            cost_price=row["cost_price"],
            sale_price=row["sale_price"],
            stock_qty=row["stock_qty"],
            low_stock_threshold=row["low_stock_threshold"],
        )

    def list_all(self) -> List[Product]:
        cur = self.conn.execute(
            "SELECT id, name, sku, cost_price, sale_price, stock_qty, low_stock_threshold FROM products ORDER BY name ASC"
        )
        rows = cur.fetchall()
        return [
            Product(
                id=row["id"],
                name=row["name"],
                sku=row["sku"],
                cost_price=row["cost_price"],
                sale_price=row["sale_price"],
                stock_qty=row["stock_qty"],
                low_stock_threshold=row["low_stock_threshold"],
            )
            for row in rows
        ]

    def adjust_stock(self, product_id: int, delta: int) -> None:
        self.conn.execute(
            "UPDATE products SET stock_qty = stock_qty + ? WHERE id = ?",
            (delta, product_id),
        )
        self.conn.commit()

    def low_stock_items(self) -> List[Product]:
        cur = self.conn.execute(
            """
            SELECT id, name, sku, cost_price, sale_price, stock_qty, low_stock_threshold
            FROM products
            WHERE stock_qty <= low_stock_threshold
            ORDER BY stock_qty ASC
            """
        )
        rows = cur.fetchall()
        return [
            Product(
                id=row["id"],
                name=row["name"],
                sku=row["sku"],
                cost_price=row["cost_price"],
                sale_price=row["sale_price"],
                stock_qty=row["stock_qty"],
                low_stock_threshold=row["low_stock_threshold"],
            )
            for row in rows
        ]