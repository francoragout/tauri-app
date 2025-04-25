import Database from "@tauri-apps/plugin-sql";
import "../App.css";
import { ExtendedCustomer, ExtendedCustomerSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersColumns } from "@/components/customers/customers-columns";

async function GetCustomers(): Promise<ExtendedCustomer[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
  SELECT 
    customers.id,
    customers.full_name,
    customers.reference,
    customers.phone,
    SUM(CAST(sales.total AS INTEGER)) AS total_sales_amount,
    GROUP_CONCAT(
      strftime('%d-%m-%Y', sales.date) || ' ($' || CAST(sales.total AS INTEGER) || ')', 
            ', '
      ) AS sales_details
FROM 
    customers
LEFT JOIN
    sales ON sales.customer_id = customers.id
GROUP BY 
    customers.id;
  `;
  const result = await db.select(query);
  return ExtendedCustomerSchema.array().parse(result);
}

export default function Customers() {
  const { data = [] } = useQuery({
    queryKey: ["customers", "sales"],
    queryFn: GetCustomers,
  });

  return <CustomersTable data={data} columns={CustomersColumns} />;
}
