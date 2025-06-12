import { getDb } from "../db";
import { Notification } from "../zod";

export async function GetNotifications(): Promise<Notification[]> {
  const db = await getDb();
  return db.select(`SELECT * FROM notifications ORDER BY date DESC`);
}
