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
  sales.id,
  sales.date,
  sales.is_paid,
  sales.surcharge_percent,
  sales.customer_id,
  customers.full_name AS customer_name,
  sales.payment_method,
  sales.total,
  GROUP_CONCAT(
    products.name || ' (x' || sale_items.quantity || ')',
    ', '
  ) AS products
  FROM
  sales
  LEFT JOIN sale_items ON sale_items.sale_id = sales.id
  LEFT JOIN products ON products.id = sale_items.product_id
  LEFT JOIN customers ON customers.id = sales.customer_id -- Unir con la tabla de clientes
  GROUP BY
  sales.id;
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
