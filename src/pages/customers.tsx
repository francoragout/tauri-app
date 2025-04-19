import Database from "@tauri-apps/plugin-sql";
import "../App.css";
import { Customer, CustomerSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersColumns } from "@/components/customers/customers-columns";

async function GetCustomers(): Promise<Customer[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
  SELECT 
    customers.id,
    customers.full_name,
    customers.classroom,
    customers.phone,
    COUNT(sales.id) AS total_sales_count,
    COALESCE(SUM(sales.total), 0) AS total_sales_amount,
    COALESCE(
      GROUP_CONCAT(
        strftime('%d-%m-%Y', sales.date) || ' ($' || sales.total || ')', 
        ', '
      ), ''
    ) AS sales_details
FROM 
    customers
LEFT JOIN
    sales ON sales.customer_id = customers.id
GROUP BY 
    customers.id, customers.full_name, customers.classroom;
  `;
  const result = await db.select(query);
  return CustomerSchema.array().parse(result);
}

export default function Customers() {
  const { data = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: GetCustomers,
  });

  return <CustomersTable data={data} columns={CustomersColumns} />;
}
