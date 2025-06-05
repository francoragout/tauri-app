import "../App.css";
import { useQuery } from "@tanstack/react-query";
import { ProductsColumns } from "@/components/products/products-columns";
import { ProductsTable } from "@/components/products/products-table";
import { Product, ProductSchema } from "@/lib/zod";
import Database from "@tauri-apps/plugin-sql";

async function GetProducts(): Promise<Product[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
    SELECT 
  products.id,
  products.name,
  products.category,
  ROUND(
    CASE WHEN SUM(purchases.quantity) > 0 THEN SUM(purchases.total) / SUM(purchases.quantity)
    ELSE 0 END, 2) AS unit_price,
  products.price,
  products.stock,
  IFNULL(SUM(sale_items.quantity), 0) AS times_sold,
  json_group_array(
	DISTINCT json_object(
    'id', owners.id,
    'name', owners.name,
    'percentage', po.percentage
    )
  ) AS owners
FROM 
  products
LEFT JOIN 
  sale_items ON products.id = sale_items.product_id
LEFT JOIN
  purchases ON products.id = purchases.product_id
LEFT JOIN
  product_owners po ON products.id = po.product_id
LEFT JOIN
  owners ON po.owner_id = owners.id
GROUP BY 
  products.id
  `;
  const result = (await db.select(query)) as any[];

  const parsed = result.map((row: any) => ({
    ...row,
    owners: JSON.parse(row.owners),
  }));

  console.log("Parsed products", parsed);

  return ProductSchema.array().parse(parsed);
}

export default function Products() {
  const { data = [] } = useQuery({
    queryKey: ["products"],
    queryFn: GetProducts,
  });

  console.log("Products data:", data);

  return <ProductsTable data={data} columns={ProductsColumns} />;
}
