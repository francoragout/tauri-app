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
    ROUND(IFNULL(SUM(purchases.total) / NULLIF(SUM(purchases.quantity), 0), 0), 2) AS unit_price,
    products.price,
    products.stock,
    IFNULL(SUM(sale_items.quantity), 0) AS times_sold
  FROM 
    products
  LEFT JOIN 
    sale_items ON products.id = sale_items.product_id
  LEFT JOIN
    purchases ON products.id = purchases.product_id
  GROUP BY 
    products.id;
`;

  const result = await db.select(query);
  return ProductSchema.array().parse(result);
}

export default function Products() {
  const { data = [] } = useQuery({
    queryKey: ["products"],
    queryFn: GetProducts,
  });

  return <ProductsTable data={data} columns={ProductsColumns} />;
}
