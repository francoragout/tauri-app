use tauri::Builder;
use tauri_plugin_sql::{Builder as SqlBuilder, Migration, MigrationKind};

pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: r#"

            CREATE TABLE IF NOT EXISTS owners (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                alias TEXT
            );

            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                category TEXT NOT NULL,
                price REAL NOT NULL,
                stock INTEGER NOT NULL,
                low_stock_threshold INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS suppliers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                phone TEXT,
                address TEXT
            );

            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                phone TEXT
            );

            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'debit', 'credit'))
            );

            CREATE TABLE IF NOT EXISTS expense_owners (
                expense_id INTEGER NOT NULL,
                owner_id INTEGER NOT NULL,
                percentage REAL NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
                FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
                FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
                PRIMARY KEY (expense_id, owner_id)
            );

            CREATE TABLE IF NOT EXISTS product_owners (
                product_id INTEGER NOT NULL,
                owner_id INTEGER NOT NULL,
                percentage REAL NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
                PRIMARY KEY (product_id, owner_id)
            );

            CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,              
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                total REAL NOT NULL,
                payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'account', 'debit', 'credit')),
                paid_at TEXT,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS sale_items (
                sale_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                price REAL NOT NULL,
                quantity INTEGER NOT NULL,
                FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
                PRIMARY KEY (sale_id, product_id)
            );

            CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                supplier_id INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,                   
                quantity INTEGER NOT NULL,
                total REAL NOT NULL,
                payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'debit', 'credit')),
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
            );
                
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                link TEXT NOT NULL,
                is_read INTEGER DEFAULT 0 CHECK (is_read IN (0, 1)),
                read_at TEXT
            );
            "#,
        kind: MigrationKind::Up,
    }];

    Builder::default()
        .plugin(
            SqlBuilder::default()
                .add_migrations("sqlite:mydatabase.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
