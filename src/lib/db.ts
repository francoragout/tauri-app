import Database from "@tauri-apps/plugin-sql";
import { z } from "zod";
import { ProductSchema } from "./zod";

let dbInstance: Awaited<ReturnType<typeof Database.load>> | null = null;

async function getDB() {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:mydatabase.db");
  }
  return dbInstance;
}

type Product = z.infer<typeof ProductSchema>;

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDB();
  const result = await db.select("SELECT * FROM products");
  return ProductSchema.array().parse(result);
}

export async function CreateProduct(product: Product): Promise<Product> {
  const db = await getDB();
  const result = await db.execute(
    `INSERT INTO products (name, variant, weight, unit, category, purchase_price, sale_price, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.name,
      product.variant,
      product.weight,
      product.unit,
      product.category,
      product.purchase_price,
      product.sale_price,
      product.stock,
    ]
  );
  return ProductSchema.parse(result);
}
