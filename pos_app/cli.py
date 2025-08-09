import time
from typing import Optional
import typer
from rich.console import Console
from rich.table import Table
from rich.live import Live

from .db import migrate, get_connection
from .services.inventory_service import InventoryService
from .services.sale_service import SaleService
from .services.dashboard_service import DashboardService
from .services.alerts_service import AlertsService
from .utils import parse_item_args

app = typer.Typer(help="Offline POS CLI")
console = Console()


@app.command()
def init_db() -> None:
    """Initialize the database."""
    migrate()
    console.print("[green]Database initialized.[/green]")


product_app = typer.Typer(help="Manage products")
sale_app = typer.Typer(help="Record sales")
alerts_app = typer.Typer(help="Alerts and notifications")

app.add_typer(product_app, name="product")
app.add_typer(sale_app, name="sale")
app.add_typer(alerts_app, name="alerts")


@product_app.command("add")
def product_add(
    name: str = typer.Option(..., help="Product name"),
    sku: str = typer.Option(..., help="Unique SKU"),
    cost_price: float = typer.Option(..., help="Cost price"),
    sale_price: float = typer.Option(..., help="Sale price"),
    stock_qty: int = typer.Option(..., help="Initial stock quantity"),
    low_stock_threshold: int = typer.Option(0, help="Low-stock threshold"),
):
    with get_connection() as conn:
        inv = InventoryService(conn)
        product_id = inv.add_product(
            name=name,
            sku=sku,
            cost_price=cost_price,
            sale_price=sale_price,
            stock_qty=stock_qty,
            low_stock_threshold=low_stock_threshold,
        )
        console.print(f"[green]Product created with ID {product_id}[/green]")


@product_app.command("list")
def product_list():
    with get_connection() as conn:
        inv = InventoryService(conn)
        products = inv.list_products()
        table = Table(title="Products")
        table.add_column("Name")
        table.add_column("SKU")
        table.add_column("Cost", justify="right")
        table.add_column("Price", justify="right")
        table.add_column("Stock", justify="right")
        table.add_column("Low-Stock", justify="right")
        for p in products:
            table.add_row(
                p.name,
                p.sku,
                f"{p.cost_price:.2f}",
                f"{p.sale_price:.2f}",
                str(p.stock_qty),
                str(p.low_stock_threshold),
            )
        console.print(table)


@product_app.command("edit")
def product_edit(
    sku: str = typer.Option(..., help="SKU to edit"),
    name: Optional[str] = typer.Option(None, help="New name"),
    cost_price: Optional[float] = typer.Option(None, help="New cost price"),
    sale_price: Optional[float] = typer.Option(None, help="New sale price"),
    stock_qty: Optional[int] = typer.Option(None, help="Set stock quantity"),
    low_stock_threshold: Optional[int] = typer.Option(None, help="New low-stock threshold"),
):
    with get_connection() as conn:
        inv = InventoryService(conn)
        updated = inv.edit_product(
            sku=sku,
            name=name,
            cost_price=cost_price,
            sale_price=sale_price,
            stock_qty=stock_qty,
            low_stock_threshold=low_stock_threshold,
        )
        if updated:
            console.print("[green]Product updated[/green]")
        else:
            console.print("[yellow]No changes or product not found[/yellow]")


@product_app.command("remove")
def product_remove(
    sku: str = typer.Option(..., help="SKU to remove"),
):
    with get_connection() as conn:
        inv = InventoryService(conn)
        removed = inv.remove_product(sku)
        if removed:
            console.print("[green]Product removed[/green]")
        else:
            console.print("[red]Product not found[/red]")


@sale_app.command("new")
def sale_new(
    item: list[str] = typer.Option(
        ..., help="Item as sku=QTY (repeat for multiple)"
    ),
):
    with get_connection() as conn:
        sale_service = SaleService(conn)
        try:
            sku_to_qty = parse_item_args(item)
            sale_id = sale_service.record_cash_sale(sku_to_qty)
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
            raise typer.Exit(code=1)
        else:
            console.print(f"[green]Sale recorded with ID {sale_id}[/green]")


@alerts_app.command("low-stock")
def alerts_low_stock():
    with get_connection() as conn:
        alerts = AlertsService(conn)
        items = alerts.low_stock()
        if not items:
            console.print("[green]No low-stock items[/green]")
            return
        table = Table(title="Low-Stock Items")
        table.add_column("Name")
        table.add_column("SKU")
        table.add_column("Stock", justify="right")
        table.add_column("Threshold", justify="right")
        for p in items:
            table.add_row(p.name, p.sku, str(p.stock_qty), str(p.low_stock_threshold))
        console.print(table)


@app.command()
def dashboard(
    watch: bool = typer.Option(False, help="Refresh continuously"),
    interval: float = typer.Option(3.0, help="Refresh interval in seconds"),
):
    def render_panel():
        with get_connection() as conn:
            dash = DashboardService(conn)
            totals = dash.get_totals()
        table = Table(title="Sales Dashboard")
        table.add_column("Metric")
        table.add_column("Value", justify="right")
        table.add_row("Total Sales (Revenue)", f"{totals['revenue']:.2f}")
        table.add_row("Total Cost (COGS)", f"{totals['cost']:.2f}")
        table.add_row("Total Profit", f"{totals['profit']:.2f}")
        table.add_row("ROI (Profit/COGS)", f"{totals['roi']:.2f}")
        return table

    if not watch:
        console.print(render_panel())
        return

    with Live(render_panel(), refresh_per_second=4, console=console) as live:
        while True:
            time.sleep(max(0.2, interval))
            live.update(render_panel())