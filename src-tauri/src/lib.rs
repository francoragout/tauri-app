use tauri::Builder;
use tauri_plugin_sql::{Builder as SqlBuilder, Migration, MigrationKind};

pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: "
                CREATE TABLE IF NOT EXISTS purchases (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id INTEGER NOT NULL,
                    date TEXT DEFAULT CURRENT_TIMESTAMP,                   
                    total REAL NOT NULL,
                    quantity INTEGER NOT NULL,
                    FOREIGN KEY (product_id) REFERENCES products(id)
                );
                
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    price REAL NOT NULL,
                    stock INTEGER NOT NULL
                );

                CREATE TABLE IF NOT EXISTS sales (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT DEFAULT CURRENT_TIMESTAMP,
                    total REAL NOT NULL,
                    payment_method TEXT NOT NULL,
                    surcharge_percent REAL NOT NULL,
                    customer_id INTEGER,
                    is_paid INTEGER DEFAULT 0 CHECK (is_paid IN (0, 1)),                 
                    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
                );

                CREATE TABLE IF NOT EXISTS sale_items (
                    sale_id INTEGER NOT NULL,
                    product_id INTEGER NOT NULL,
                    price REAL NOT NULL,
                    quantity INTEGER NOT NULL,
                    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                    PRIMARY KEY (sale_id, product_id)
                );             

                CREATE TABLE IF NOT EXISTS customers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    full_name TEXT NOT NULL,
                    reference TEXT,
                    phone TEXT
                );
            ",
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
