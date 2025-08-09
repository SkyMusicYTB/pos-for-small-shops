# Offline POS (Point-of-Sale) for Small Shops

A lightweight, offline-first POS CLI tailored for small shop owners in developing countries. Focuses on simplicity, speed, and reliability with minimal hardware requirements.

## Features
- Cash-only sales
- Inventory management: add, edit, remove products
- Track stock with per-item low-stock thresholds
- Low-stock alerts command
- Sales & dashboard: total sales, profit, ROI (on-demand or watch mode)
- Modular architecture for easy future extensions (e.g., multi-user, barcodes, customers)

## Tech Stack
- Python 3.9+
- SQLite (bundled with Python)
- Typer (CLI)
- Rich (beautiful terminal output)

## Quick Start

### 1) Install Python 3.9+
Ensure `python3` and `pip` are available.

### 2) Create a virtual environment
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3) Install dependencies
```bash
pip install -r requirements.txt
```

### 4) Initialize the database
```bash
python -m pos_app init-db
```

### 5) Basic usage

- Add a product
```bash
python -m pos_app product add \
  --name "Soda 350ml" \
  --sku SODA-350 \
  --cost-price 0.30 \
  --sale-price 0.50 \
  --stock-qty 48 \
  --low-stock-threshold 6
```

- List products
```bash
python -m pos_app product list
```

- Edit a product
```bash
python -m pos_app product edit --sku SODA-350 --sale-price 0.55 --low-stock-threshold 8
```

- Remove a product
```bash
python -m pos_app product remove --sku SODA-350
```

- Record a sale (cash-only). Use repeated `--item` options as `sku=QTY`.
```bash
python -m pos_app sale new --item SODA-350=2 --item CHIPS-40=1
```

- Show low-stock alerts
```bash
python -m pos_app alerts low-stock
```

- Show dashboard (on-demand)
```bash
python -m pos_app dashboard
```

- Dashboard watch mode (refresh every 3s)
```bash
python -m pos_app dashboard --watch --interval 3
```

## ROI Definition
- Profit = Sum((sale_price - cost_price) * quantity) over all sold items
- Cost of Goods Sold (COGS) = Sum(cost_price * quantity)
- ROI = Profit / COGS (shown as a ratio)

## Architecture Overview
```
pos_app/
  __init__.py
  __main__.py           # Entry point: `python -m pos_app`
  cli.py                # Typer CLI commands
  db.py                 # SQLite connection + migrations
  models.py             # Typed data structures
  utils.py
  repositories/
    __init__.py
    product_repo.py
    sale_repo.py
  services/
    __init__.py
    inventory_service.py
    sale_service.py
    dashboard_service.py
    alerts_service.py
```

- Repositories: database CRUD
- Services: business logic
- CLI: user interface commands only

## Backup & Portability
- The app stores data in a single SQLite file `pos_app.db` in the project root by default.
- Regularly copy this file to a USB drive or cloud backup if available.

## Extensibility Ideas
- Multi-user and roles: add `users` table, auth, and role checks in services
- Barcode scanning: map scanner input to `sku`
- Customer database: add `customers` and link to `sales`

## Troubleshooting
- If you see a database lock error, wait a moment and retry. Avoid running concurrent writes.
- For any Unicode/locale issues, ensure your terminal encoding is UTF-8.

## License
MIT
