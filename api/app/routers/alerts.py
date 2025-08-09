from fastapi import APIRouter, Depends
from typing import List

from ..deps import get_tenant_connection
from ..models import LowStockOut

router = APIRouter(prefix="/alerts", tags=["alerts"]) 


@router.get("/low-stock", response_model=List[LowStockOut])
async def low_stock(conn=Depends(get_tenant_connection)):
    rows = await conn.fetch(
        """
        SELECT id, sku, name, stock_qty, low_stock_threshold
        FROM product
        WHERE active = true AND stock_qty <= low_stock_threshold
        ORDER BY name
        """
    )
    return [LowStockOut(**dict(r)) for r in rows]