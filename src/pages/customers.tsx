import Database from "@tauri-apps/plugin-sql";
import "../App.css";
import { useQuery } from "@tanstack/react-query";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersColumns } from "@/components/customers/customers-columns";
import { Customer, CustomerSchema } from "@/lib/zod";

async function GetCustomers(): Promise<Customer[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const result = await db.select(`SELECT * FROM customers`);
  return CustomerSchema.array().parse(result);
}

export default function Customers() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: GetCustomers,
  });

  return (
    <CustomersTable
      data={data}
      columns={CustomersColumns}
      isLoading={isLoading}
    />
  );
}
