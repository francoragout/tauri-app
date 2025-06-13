import Database from "@tauri-apps/plugin-sql";
import "../App.css";
import { useQuery } from "@tanstack/react-query";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersColumns } from "@/components/customers/customers-columns";
import { Customer, CustomerSchema } from "@/lib/zod";
import { LoadingSkeleton } from "@/components/skeletons";

async function GetCustomers(): Promise<Customer[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const result = await db.select(`SELECT * FROM customers`);
  return CustomerSchema.array().parse(result);
}

export default function Customers() {
  const { data = [], isPending } = useQuery({
    queryKey: ["customers"],
    queryFn: GetCustomers,
  });

  if (isPending) {
    return <LoadingSkeleton />;
  }

  return <CustomersTable data={data} columns={CustomersColumns} />;
}
