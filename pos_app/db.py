import sqlite3
from pathlib import Path
from typing import Iterable, Optional

DB_PATH = Path(__file__).resolve().parent.parent / "pos_app.db"


def get_connection(db_path: Optional[Path] = None) -> sqlite3.Connection:
    path = db_path or DB_PATH
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


SCHEMA_STATEMENTS: Iterable[str] = [
    # Products
    """
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT NOT NULL UNIQUE,
        cost_price REAL NOT NULL CHECK(cost_price >= 0),
        sale_price REAL NOT NULL CHECK(sale_price >= 0),
        stock_qty INTEGER NOT NULL CHECK(stock_qty >= 0),
        low_stock_threshold INTEGER NOT NULL CHECK(low_stock_threshold >= 0),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    """,
    # Sales
    """
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        total_amount REAL NOT NULL,
        total_cost REAL NOT NULL,
        total_profit REAL NOT NULL
    );
    """,
    # Sale items
    """
    CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK(quantity > 0),
        unit_price REAL NOT NULL,
        unit_cost REAL NOT NULL,
        line_total REAL NOT NULL,
        line_cost REAL NOT NULL,
        line_profit REAL NOT NULL,
        FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE RESTRICT
    );
    """,
    # Trigger to update product updated_at
    """
    CREATE TRIGGER IF NOT EXISTS trg_products_updated_at
    AFTER UPDATE ON products
    BEGIN
        UPDATE products SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
    """,
]


def migrate(db_path: Optional[Path] = None) -> None:
    with get_connection(db_path) as conn:
        for stmt in SCHEMA_STATEMENTS:
            conn.execute(stmt)
        conn.commit()