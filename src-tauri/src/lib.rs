use tauri_plugin_sql::{Migration, MigrationKind};

fn get_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create_products_table",
        sql: r#"
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    category TEXT NOT NULL,
                    name TEXT NOT NULL,
                    variant TEXT,
                    weight TEXT,
                    purchase_price REAL NOT NULL,
                    sale_price REAL NOT NULL,
                    stock INTEGER NOT NULL
                );
            "#,
        kind: MigrationKind::Up,
    }]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:mydatabase.db", get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
