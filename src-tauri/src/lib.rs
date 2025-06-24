use tauri::Builder;
use tauri_plugin_sql::{Builder as SqlBuilder, Migration, MigrationKind};

pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "

        CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            phone TEXT,
            address TEXT
        );

        CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            supplier_id INTEGER,
            date TEXT DEFAULT CURRENT_TIMESTAMP,                   
            quantity INTEGER NOT NULL,
            total REAL NOT NULL,
            payment_method TEXT NOT NULL,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS owners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS product_owners (
            product_id INTEGER NOT NULL,
            owner_id INTEGER NOT NULL,
            percentage REAL NOT NULL,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
            PRIMARY KEY (product_id, owner_id)
        );
                
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            low_stock_threshold INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,              
            date TEXT DEFAULT CURRENT_TIMESTAMP,
            total REAL NOT NULL,
            surcharge INTEGER NOT NULL DEFAULT 0,
            payment_method TEXT NOT NULL,
            is_paid INTEGER DEFAULT 0 CHECK (is_paid IN (0, 1)),
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

        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            reference TEXT,
            phone TEXT
        );

        CREATE TABLE IF NOT EXISTS expense_owners (
            expense_id INTEGER NOT NULL,
            owner_id INTEGER NOT NULL,
            percentage REAL NOT NULL,
            FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
            FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
            PRIMARY KEY (expense_id, owner_id)
        );

        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT DEFAULT CURRENT_TIMESTAMP,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT DEFAULT CURRENT_TIMESTAMP,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            link TEXT NOT NULL,
            is_read INTEGER DEFAULT 0 CHECK (is_read IN (0, 1)),
            read_at TEXT
        );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "rename_date_to_created_at_in_tables",
            sql: "\
            -- Renombrar columna date a created_at en purchases
            ALTER TABLE purchases RENAME COLUMN date TO created_at;
            -- Renombrar columna date a created_at en sales
            ALTER TABLE sales RENAME COLUMN date TO created_at;
            -- Renombrar columna date a created_at en expenses
            ALTER TABLE expenses RENAME COLUMN date TO created_at;
            -- Renombrar columna date a created_at en notifications
            ALTER TABLE notifications RENAME COLUMN date TO created_at;
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add_alias_to_owners_and_make_name_unique",
            sql: "
            ALTER TABLE owners ADD COLUMN alias TEXT;
            CREATE UNIQUE INDEX IF NOT EXISTS idx_owners_name_unique ON owners(name);
            ",
            kind: MigrationKind::Up,
        },
    ];

    Builder::default()
        .plugin(
            SqlBuilder::default()
                .add_migrations("sqlite:mydatabase.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
