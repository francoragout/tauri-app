use tauri::Builder;
use tauri_plugin_sql::{Builder as SqlBuilder, Migration, MigrationKind};

pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    variant TEXT,
                    weight REAL,
                    unit TEXT,
                    category TEXT,
                    price REAL NOT NULL,
                    stock INTEGER NOT NULL
                );

                CREATE TABLE IF NOT EXISTS sales (
                    id INTEGER PRIMARY KEY,
                    date TEXT DEFAULT CURRENT_TIMESTAMP,
                    total REAL NOT NULL
                );

                CREATE TABLE IF NOT EXISTS sale_items (
                    sale_id INTEGER NOT NULL,
                    product_id INTEGER NOT NULL,
                    quantity INTEGER NOT NULL,
                    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                    PRIMARY KEY (sale_id, product_id)
                );
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
