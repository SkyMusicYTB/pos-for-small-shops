from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from ..deps import get_tenant_connection
from ..models import DailyZReport, DashboardKPIs

router = APIRouter(prefix="/reports", tags=["reports"]) 


@router.get("/daily-z", response_model=DailyZReport)
async def daily_z(date: str, conn=Depends(get_tenant_connection)):
    # date format YYYY-MM-DD
    start = datetime.fromisoformat(date).replace(tzinfo=timezone.utc)
    end = start + timedelta(days=1)
    row = await conn.fetchrow(
        "SELECT COALESCE(SUM(total),0) as total_sales, COUNT(*) as cnt FROM sale WHERE created_at >= $1 AND created_at < $2",
        start, end
    )
    return DailyZReport(business_id="", date=date, total_sales=float(row["total_sales"]), total_transactions=row["cnt"])  # business_id is implicit by tenant


@router.get("/dashboard", response_model=DashboardKPIs)
async def dashboard(start: str, end: str, conn=Depends(get_tenant_connection)):
    start_dt = datetime.fromisoformat(start).replace(tzinfo=timezone.utc)
    end_dt = datetime.fromisoformat(end).replace(tzinfo=timezone.utc)

    sales_row = await conn.fetchrow(
        "SELECT COALESCE(SUM(total),0) as total_sales FROM sale WHERE created_at >= $1 AND created_at <= $2",
        start_dt, end_dt
    )
    gp_row = await conn.fetchrow(
        """
        SELECT COALESCE(SUM((si.sell_price_at_time - si.cost_price_at_time) * si.qty),0) as gp
        FROM sale_item si
        JOIN sale s ON s.id = si.sale_id
        WHERE s.created_at >= $1 AND s.created_at <= $2
        """,
        start_dt, end_dt
    )
    inv_row = await conn.fetchrow(
        "SELECT COALESCE(SUM(cost_price * stock_qty),0) as inv_cost FROM product WHERE active = true",
    )

    total_sales = float(sales_row["total_sales"]) if sales_row else 0.0
    gross_profit = float(gp_row["gp"]) if gp_row else 0.0
    inv_cost_on_hand = float(inv_row["inv_cost"]) if inv_row else 0.0

    roi = None
    if inv_cost_on_hand > 0:
        roi = gross_profit / inv_cost_on_hand

    return DashboardKPIs(start=start_dt, end=end_dt, total_sales=total_sales, gross_profit=gross_profit, roi=roi)