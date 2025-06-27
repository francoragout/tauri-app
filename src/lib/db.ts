// db.ts
import Database from "@tauri-apps/plugin-sql";

let dbInstance: Awaited<ReturnType<typeof Database.load>>;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:mydatabase.db");

    // Activar claves foráneas — ¡muy importante!
    await dbInstance.execute("PRAGMA foreign_keys = ON");
    console.log("Foreign key support enabled");
  }
  return dbInstance;
}
