import "../App.css";
import Database from "@tauri-apps/plugin-sql";
import { useQuery } from "@tanstack/react-query";
import { SalesTable } from "@/components/sales/sales-table";
import { SalesColumns } from "@/components/sales/sales-columns";
import { Sale, SaleSchema } from "@/lib/zod";
import { LoadingSkeleton } from "@/components/skeletons";

async function GetSales(): Promise<Sale[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
    SELECT
      s.id,
      datetime(s.date, '-3 hours') AS local_date,
      datetime(s.paid_at, '-3 hours') AS payment_date,
      s.is_paid,
      s.customer_id,
      c.name AS customer_name,
      s.payment_method,
      s.surcharge,
      s.total,
      json_group_array(json_object('id', p.id, 'name', p.name, 'quantity', si.quantity)) AS products
    FROM sales s
    LEFT JOIN sale_items si ON si.sale_id = s.id
    LEFT JOIN products p ON p.id = si.product_id
    LEFT JOIN customers c ON c.id = s.customer_id
    GROUP BY s.id;
  `;
  const result = (await db.select(query)) as any[];

  const parsed = result.map((row: any) => ({
    ...row,
    products: JSON.parse(row.products),
  }));

  return SaleSchema.array().parse(parsed);
}

export default function Sales() {
  const { data = [], isPending } = useQuery({
    queryKey: ["sales"],
    queryFn: GetSales,
  });

  if (isPending) {
    return <LoadingSkeleton />;
  }

  return <SalesTable data={data} columns={SalesColumns} />;
}
