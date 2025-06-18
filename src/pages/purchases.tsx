import { PurchasesColumns } from "@/components/purchases/purchases-columns";
import { PurchasesTable } from "@/components/purchases/purchases-table";
import { getDb } from "@/lib/db";
import { Purchase, PurchaseSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";

async function getPurchases(): Promise<Purchase[]> {
  const db = await getDb();
  const query = `
    SELECT 
      purchases.id,
      datetime(purchases.created_at, '-3 hours') AS local_date,
	    purchases.product_id,
      products.name AS product_name, 
	    purchases.supplier_id,
	    suppliers.name AS supplier_name,
      purchases.quantity,
      purchases.total,    
	    purchases.payment_method
    FROM purchases 
    LEFT JOIN products ON products.id = purchases.product_id
	  LEFT JOIN suppliers ON purchases.supplier_id = suppliers.id
  `;

  const result = await db.select(query);
  return PurchaseSchema.array().parse(result);
}

export default function Purchases() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: getPurchases,
  });

  return (
    <PurchasesTable
      data={data}
      columns={PurchasesColumns}
      isLoading={isLoading}
    />
  );
}
