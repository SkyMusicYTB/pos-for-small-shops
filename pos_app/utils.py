from typing import Dict


def parse_item_args(item_args: list[str]) -> Dict[str, int]:
    sku_to_qty: Dict[str, int] = {}
    for item in item_args:
        if "=" not in item:
            raise ValueError(f"Invalid item format: {item}. Expected sku=QTY")
        sku, qty_str = item.split("=", 1)
        sku = sku.strip()
        try:
            qty = int(qty_str)
        except ValueError:
            raise ValueError(f"Invalid quantity for {sku}: {qty_str}")
        if qty <= 0:
            raise ValueError(f"Quantity must be positive for {sku}")
        sku_to_qty[sku] = sku_to_qty.get(sku, 0) + qty
    return sku_to_qty