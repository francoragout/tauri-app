import { SuppliersColumns } from "@/components/suppliers/suppliers-columns";
import { SuppliersTable } from "@/components/suppliers/suppliers-table";
import { Supplier, SupplierSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";

async function GetSuppliers(): Promise<Supplier[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const result = await db.select(`SELECT * FROM suppliers`);
  return SupplierSchema.array().parse(result);
}

export default function Suppliers() {
  const { data = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: GetSuppliers,
  });
  return <SuppliersTable data={data} columns={SuppliersColumns} />;
}
