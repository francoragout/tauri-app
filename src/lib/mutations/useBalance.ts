import { getDb } from "../db";

export async function GetBalance(): Promise<number> {
  const db = await getDb();
  const [row] = (await db.select(`
    SELECT
      IFNULL((SELECT SUM(total) FROM sales), 0) -
      IFNULL((SELECT SUM(total) FROM purchases), 0) -
      IFNULL((SELECT SUM(amount) FROM expenses), 0) AS balance_total
  `)) as { balance_total: number | null }[];

  return row?.balance_total ?? 0;
}
