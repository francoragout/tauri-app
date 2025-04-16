// src/pages/products.tsx
import "../App.css";
import { useQuery } from "@tanstack/react-query";
import { ProductsColumns } from "@/components/products/products-columns";
import { ProductsTable } from "@/components/products/products-table";
import { z } from "zod";
import { ProductSchema } from "@/lib/zod";
import Database from "@tauri-apps/plugin-sql";


type Product = z.infer<typeof ProductSchema>;

async function GetProducts(): Promise<Product[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const result = await db.select("SELECT * FROM products");
  return ProductSchema.array().parse(result);
}

export default function Products() {
  const { data = [] } = useQuery({
    queryKey: ["products"],
    queryFn: GetProducts,
  });

  return <ProductsTable data={data} columns={ProductsColumns} />;
}
