from typing import Dict, List, Tuple
import sqlite3


class SaleRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn

    def create_sale(
        self,
        items: List[Tuple[int, int, float, float]],
    ) -> int:
        """
        Create a sale with items.
        items: list of tuples (product_id, quantity, unit_price, unit_cost)
        Returns new sale_id.
        """
        total_amount = 0.0
        total_cost = 0.0
        total_profit = 0.0

        for _, quantity, unit_price, unit_cost in items:
            line_total = unit_price * quantity
            line_cost = unit_cost * quantity
            total_amount += line_total
            total_cost += line_cost
            total_profit += (unit_price - unit_cost) * quantity

        cur = self.conn.cursor()
        try:
            cur.execute(
                "INSERT INTO sales(total_amount, total_cost, total_profit) VALUES (?, ?, ?)",
                (total_amount, total_cost, total_profit),
            )
            sale_id = int(cur.lastrowid)
            for product_id, quantity, unit_price, unit_cost in items:
                line_total = unit_price * quantity
                line_cost = unit_cost * quantity
                line_profit = (unit_price - unit_cost) * quantity
                cur.execute(
                    """
                    INSERT INTO sale_items(sale_id, product_id, quantity, unit_price, unit_cost, line_total, line_cost, line_profit)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        sale_id,
                        product_id,
                        quantity,
                        unit_price,
                        unit_cost,
                        line_total,
                        line_cost,
                        line_profit,
                    ),
                )
                # Reduce stock
                cur.execute(
                    "UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?",
                    (quantity, product_id),
                )
        except Exception:
            self.conn.rollback()
            raise
        else:
            self.conn.commit()
            return sale_id

    def totals(self) -> Dict[str, float]:
        cur = self.conn.execute(
            "SELECT COALESCE(SUM(total_amount), 0), COALESCE(SUM(total_cost), 0), COALESCE(SUM(total_profit), 0) FROM sales"
        )
        revenue, cost, profit = cur.fetchone()
        return {"revenue": float(revenue), "cost": float(cost), "profit": float(profit)}