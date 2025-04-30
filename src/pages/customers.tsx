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
  COALESCE(SUM(sale_items.quantity * products.price), 0) AS debt
  FROM customers
  LEFT JOIN sales ON sales.customer_id = customers.id AND sales.is_paid = 0
  LEFT JOIN sale_items ON sale_items.sale_id = sales.id
  LEFT JOIN products ON products.id = sale_items.product_id
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
