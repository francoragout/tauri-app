import { PurchasesColumns } from "@/components/purchases/purchases-columns";
import { PurchasesTable } from "@/components/purchases/purchases-table";
import { Purchase, PurchaseSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";

async function getPurchases(): Promise<Purchase[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
  SELECT 
      purchases.id, 
      datetime(purchases.date, '-3 hours') AS local_date,
      products.name AS product_name, 
      purchases.product_id,
      purchases.total, 
      purchases.quantity 
    FROM purchases 
    LEFT JOIN products ON products.id = purchases.product_id
  `;

  const result = await db.select(query);
  return PurchaseSchema.array().parse(result);
}

export default function Purchases() {
  const { data = [] } = useQuery({
    queryKey: ["purchases"],
    queryFn: getPurchases,
  });

  return <PurchasesTable data={data} columns={PurchasesColumns} />;
}
