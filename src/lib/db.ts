// db.ts
import Database from "@tauri-apps/plugin-sql";

let dbInstance: Awaited<ReturnType<typeof Database.load>>;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:mydatabase.db");

    // Solo lo hacemos una vez, al iniciar la conexión
    await dbInstance.execute("PRAGMA foreign_keys = ON");
    console.log("✅ PRAGMA foreign_keys activado");
  }

  return dbInstance;
}
