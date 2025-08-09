from fastapi import APIRouter, Depends, HTTPException
from decimal import Decimal

from ..deps import get_tenant_connection, get_current_user, require_role
from ..models import SaleIn, SaleOut

router = APIRouter(prefix="/sales", tags=["sales"]) 


@router.post("", response_model=SaleOut, dependencies=[Depends(require_role("owner", "manager", "cashier"))])
async def create_sale(payload: SaleIn, conn=Depends(get_tenant_connection), user=Depends(get_current_user)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="No items")

    async with conn.transaction():
        # Load products
        product_ids = [i.product_id for i in payload.items]
        rows = await conn.fetch(
            "SELECT id, sell_price, cost_price, tax_rate, stock_qty FROM product WHERE id = ANY($1::uuid[]) FOR UPDATE",
            product_ids,
        )
        product_map = {str(r["id"]): r for r in rows}
        if len(product_map) != len(product_ids):
            raise HTTPException(status_code=400, detail="Invalid product in items")

        subtotal = Decimal("0.00")
        tax_total = Decimal("0.00")

        for item in payload.items:
            prod = product_map[item.product_id]
            if Decimal(str(prod["stock_qty"])) < Decimal(str(item.qty)):
                raise HTTPException(status_code=400, detail="Insufficient stock for a product")
            line = Decimal(str(prod["sell_price"])) * Decimal(str(item.qty))
            subtotal += line
            if prod["tax_rate"] is not None:
                tax_total += line * Decimal(str(prod["tax_rate"])) / Decimal("100")

        discount = Decimal(str(payload.discount_amount or 0))
        if discount < 0 or discount > subtotal:
            raise HTTPException(status_code=400, detail="Invalid discount")
        total = subtotal - discount + tax_total

        cash_received = total  # cash-only, assume exact for MVP; UI will send exact
        change_due = Decimal("0.00")

        sale_row = await conn.fetchrow(
            """
            INSERT INTO sale (user_id, subtotal, discount_amount, tax_amount, total, cash_received, change_due)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING id, subtotal, discount_amount, tax_amount, total, cash_received, change_due, created_at
            """,
            user["user_id"], subtotal, discount, tax_total, total, cash_received, change_due
        )
        sale_id = sale_row["id"]

        for item in payload.items:
            prod = product_map[item.product_id]
            qty = Decimal(str(item.qty))
            sell_price = Decimal(str(prod["sell_price"]))
            cost_price = Decimal(str(prod["cost_price"]))
            line_total = sell_price * qty
            await conn.execute(
                """
                INSERT INTO sale_item (sale_id, product_id, qty, sell_price_at_time, cost_price_at_time, line_total)
                VALUES ($1,$2,$3,$4,$5,$6)
                """,
                sale_id, item.product_id, qty, sell_price, cost_price, line_total
            )
            await conn.execute(
                "UPDATE product SET stock_qty = stock_qty - $2 WHERE id = $1",
                item.product_id, qty
            )

        # Audit
        await conn.execute(
            "INSERT INTO audit_log (business_id, user_id, action, entity, entity_id, payload) VALUES (current_setting('app.current_business')::uuid,$1,'create','sale',$2,$3)",
            user["user_id"], sale_id, {"items": [i.dict() for i in payload.items], "discount_amount": str(discount), "total": str(total)}
        )

        return SaleOut(**dict(sale_row))