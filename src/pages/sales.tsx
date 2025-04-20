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
      sales.id AS sale_id,
      sales.date AS sale_date,
      sales.total AS sale_total,
      GROUP_CONCAT(
        products.brand || 
        ' ' || IFNULL(products.variant, '') || 
        ' ' || IFNULL(products.weight, '') || 
        ' (x' || sale_items.quantity || ')', 
        ', '
      ) AS products_summary,
      (customers.full_name || ' - ' || customers.reference) AS customer_info
    FROM 
      sales
    LEFT JOIN 
      sale_items ON sales.id = sale_items.sale_id
    LEFT JOIN 
      products ON sale_items.product_id = products.id
    LEFT JOIN
      customers ON sales.customer_id = customers.id
    GROUP BY 
      sales.id, sales.date, sales.total;
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
