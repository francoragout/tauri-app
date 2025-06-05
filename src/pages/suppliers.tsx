import { LoadingSkeleton } from "@/components/skeletons";
import { SuppliersColumns } from "@/components/suppliers/suppliers-columns";
import { SuppliersTable } from "@/components/suppliers/suppliers-table";
import { Supplier, SupplierSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";

async function GetSuppliers(): Promise<Supplier[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
    SELECT 
      suppliers.id,
      suppliers.name,
      suppliers.phone,
      suppliers.address,
      CASE
        WHEN COUNT(DISTINCT products.id) = 0 THEN NULL
        ELSE json_group_array(
          DISTINCT json_object(
            'id', products.id,
            'name', products.name
          )
        )
      END AS products
    FROM suppliers
    LEFT JOIN purchases ON purchases.supplier_id = suppliers.id
    LEFT JOIN products ON purchases.product_id = products.id
    GROUP BY suppliers.id;
  `;
  const result = (await db.select(query)) as any[];

  const parsed = result.map((row: any) => ({
    ...row,
    products: row.products ? JSON.parse(row.products) : null,
  }));

  return SupplierSchema.array().parse(parsed);
}

export default function Suppliers() {
  const { data = [], isPending } = useQuery({
    queryKey: ["suppliers"],
    queryFn: GetSuppliers,
  });

  if (isPending) {
    return <LoadingSkeleton />;
  }

  return <SuppliersTable data={data} columns={SuppliersColumns} />;
}
