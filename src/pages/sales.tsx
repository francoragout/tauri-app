import "../App.css";
import Database from "@tauri-apps/plugin-sql";
import { useQuery } from "@tanstack/react-query";
import { SalesTable } from "@/components/sales/sales-table";
import { SalesColumns } from "@/components/sales/sales-columns";
import { SaleItems, SaleItemsSchema } from "@/lib/zod";

async function GetSales(): Promise<SaleItems[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
  SELECT
    s.id,
    datetime(s.date, '-3 hours') AS local_date,
    s.is_paid,
    s.customer_id,
    c.full_name AS customer_name,
    s.payment_method,
    s.total,
  GROUP_CONCAT(p.name || ' (x' || si.quantity || ')', ', ') AS products
  FROM sales s
  LEFT JOIN sale_items si ON si.sale_id = s.id
  LEFT JOIN products p ON p.id = si.product_id
  LEFT JOIN customers c ON c.id = s.customer_id
  GROUP BY s.id;
  `;
  const result = await db.select(query);
  return SaleItemsSchema.array().parse(result);
}

export default function Sales() {
  const { data = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: GetSales,
  });

  return <SalesTable data={data} columns={SalesColumns} />;
}
