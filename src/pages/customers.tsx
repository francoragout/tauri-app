import Database from "@tauri-apps/plugin-sql";
import "../App.css";
import { useQuery } from "@tanstack/react-query";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersColumns } from "@/components/customers/customers-columns";
import { Customer, CustomerSchema } from "@/lib/zod";

async function GetCustomers(): Promise<Customer[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
         WITH sale_totals AS (
  SELECT 
    sale_items.sale_id,
    SUM(sale_items.quantity * products.price) AS total
  FROM sale_items
  JOIN products ON products.id = sale_items.product_id
  GROUP BY sale_items.sale_id
)
SELECT 
  customers.id,
  customers.full_name,
  customers.reference,
  customers.phone,
  COALESCE(SUM(st.total), 0) AS debt,
  (
    SELECT GROUP_CONCAT(datetime(s.date, '-3 hours') || ' ' || st2.total, ', ')
    FROM sales s
    LEFT JOIN sale_totals st2 ON st2.sale_id = s.id
    WHERE s.customer_id = customers.id
      AND s.is_paid = 0
    ORDER BY s.date
  ) AS sales_summary
FROM customers
LEFT JOIN sales ON sales.customer_id = customers.id AND sales.is_paid = 0
LEFT JOIN sale_totals st ON st.sale_id = sales.id
GROUP BY customers.id;


  `;
  const result = await db.select(query);
  return CustomerSchema.array().parse(result);
}

export default function Customers() {
  const { data = [] } = useQuery({
    queryKey: ["customers", "sales"],
    queryFn: GetCustomers,
  });

  return <CustomersTable data={data} columns={CustomersColumns} />;
}
