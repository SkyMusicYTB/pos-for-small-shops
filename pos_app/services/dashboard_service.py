from typing import Dict
import sqlite3
from ..repositories.sale_repo import SaleRepository


class DashboardService:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self.sales = SaleRepository(conn)

    def get_totals(self) -> Dict[str, float]:
        totals = self.sales.totals()
        revenue = totals["revenue"]
        cost = totals["cost"]
        profit = totals["profit"]
        roi = (profit / cost) if cost > 0 else 0.0
        return {"revenue": revenue, "cost": cost, "profit": profit, "roi": roi}