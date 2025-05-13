import { PurchasesColumns } from "@/components/purchases/purchases-columns";
import { PurchasesTable } from "@/components/purchases/purchases-table";
import { Product, ProductSchema, Purchase, PurchaseSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";

async function getPurchases(): Promise<Purchase[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
  SELECT 
      purchases.id, 
      purchases.date, 
      products.name AS product_name, 
      purchases.product_id,
      purchases.total, 
      purchases.quantity 
    FROM purchases 
    LEFT JOIN products ON products.id = purchases.product_id
  `;

  const result = await db.select(query);
  return PurchaseSchema.array().parse(result);
}

async function getProducts(): Promise<Product[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const result = await db.select(`SELECT * FROM products`);
  return ProductSchema.array().parse(result);
}

export default function Purchases() {
  const { data = [] } = useQuery({
    queryKey: ["purchases"],
    queryFn: getPurchases,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  return (
    <PurchasesTable
      data={data}
      columns={PurchasesColumns}
      products={products}
    />
  );
}
