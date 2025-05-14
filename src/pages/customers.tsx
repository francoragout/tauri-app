import Database from "@tauri-apps/plugin-sql";
import "../App.css";
import { useQuery } from "@tanstack/react-query";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersColumns } from "@/components/customers/customers-columns";
import { Customer, CustomerSchema } from "@/lib/zod";

async function GetCustomers(): Promise<Customer[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
          SELECT 
    customers.id,
    customers.full_name,
    customers.reference,
    customers.phone,
    SUM(sale_totals.total) AS debt,
    (
      SELECT GROUP_CONCAT(sales.date || ' ' || sale_totals.total, ', ')
      FROM sales
      LEFT JOIN (
        SELECT 
          sale_items.sale_id,
          SUM(sale_items.quantity * products.price) AS total
        FROM sale_items
        JOIN products ON products.id = sale_items.product_id
        GROUP BY sale_items.sale_id
      ) AS sale_totals ON sale_totals.sale_id = sales.id
      WHERE sales.customer_id = customers.id
      ORDER BY sales.date
    ) AS sales_summary
  FROM customers
  LEFT JOIN sales ON sales.customer_id = customers.id
  LEFT JOIN (
    SELECT 
      sale_items.sale_id,
      SUM(sale_items.quantity * products.price) AS total
    FROM sale_items
    JOIN products ON products.id = sale_items.product_id
    GROUP BY sale_items.sale_id
  ) AS sale_totals ON sale_totals.sale_id = sales.id
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
