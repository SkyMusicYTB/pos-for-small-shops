from fastapi import APIRouter, Depends, HTTPException
from typing import List

from ..deps import get_tenant_connection, require_role
from ..models import ProductIn, ProductOut

router = APIRouter(prefix="/products", tags=["products"]) 


@router.post("", response_model=ProductOut, dependencies=[Depends(require_role("owner", "manager"))])
async def create_product(payload: ProductIn, conn=Depends(get_tenant_connection)):
    try:
        row = await conn.fetchrow(
            """
            INSERT INTO product (sku, name, category, cost_price, sell_price, tax_rate, stock_qty, low_stock_threshold, active)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING id, business_id, sku, name, category, cost_price, sell_price, tax_rate, stock_qty, low_stock_threshold, active, created_at
            """,
            payload.sku,
            payload.name,
            payload.category,
            payload.cost_price,
            payload.sell_price,
            payload.tax_rate,
            payload.stock_qty,
            payload.low_stock_threshold,
            payload.active,
        )
    except Exception as e:
        if "unique" in str(e).lower() and "sku" in str(e).lower():
            raise HTTPException(status_code=400, detail="SKU already exists")
        raise
    return ProductOut(**dict(row))


@router.get("", response_model=List[ProductOut])
async def list_products(conn=Depends(get_tenant_connection)):
    rows = await conn.fetch(
        """
        SELECT id, business_id, sku, name, category, cost_price, sell_price, tax_rate, stock_qty, low_stock_threshold, active, created_at
        FROM product
        WHERE active = true
        ORDER BY name
        """
    )
    return [ProductOut(**dict(r)) for r in rows]


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str, conn=Depends(get_tenant_connection)):
    row = await conn.fetchrow(
        """
        SELECT id, business_id, sku, name, category, cost_price, sell_price, tax_rate, stock_qty, low_stock_threshold, active, created_at
        FROM product WHERE id = $1
        """,
        product_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return ProductOut(**dict(row))


@router.put("/{product_id}", response_model=ProductOut, dependencies=[Depends(require_role("owner", "manager"))])
async def update_product(product_id: str, payload: ProductIn, conn=Depends(get_tenant_connection)):
    try:
        row = await conn.fetchrow(
            """
            UPDATE product SET sku=$2, name=$3, category=$4, cost_price=$5, sell_price=$6, tax_rate=$7, stock_qty=$8, low_stock_threshold=$9, active=$10
            WHERE id=$1
            RETURNING id, business_id, sku, name, category, cost_price, sell_price, tax_rate, stock_qty, low_stock_threshold, active, created_at
            """,
            product_id,
            payload.sku,
            payload.name,
            payload.category,
            payload.cost_price,
            payload.sell_price,
            payload.tax_rate,
            payload.stock_qty,
            payload.low_stock_threshold,
            payload.active,
        )
    except Exception as e:
        if "unique" in str(e).lower() and "sku" in str(e).lower():
            raise HTTPException(status_code=400, detail="SKU already exists")
        raise
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return ProductOut(**dict(row))


@router.delete("/{product_id}", dependencies=[Depends(require_role("owner", "manager"))])
async def delete_product(product_id: str, conn=Depends(get_tenant_connection)):
    res = await conn.execute("UPDATE product SET active=false WHERE id=$1", product_id)
    return {"status": "ok"}