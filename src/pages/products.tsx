import "../App.css";
import { useQuery } from "@tanstack/react-query";
import { ProductsColumns } from "@/components/products/products-columns";
import { ProductsTable } from "@/components/products/products-table";
import { Product, ProductSchema } from "@/lib/zod";
import Database from "@tauri-apps/plugin-sql";

async function GetProducts(): Promise<Product[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
    WITH purchase_calculations AS (
      SELECT 
        product_id, 
        SUM(total) AS total_amount, 
        SUM(quantity) AS total_quantity
      FROM purchases
      GROUP BY product_id
    ),

    sales_summary AS (
      SELECT 
        product_id, 
        SUM(quantity) AS times_sold
      FROM sale_items
      GROUP BY product_id
    )

    SELECT 
      p.id,
      p.name,
      p.category,
      ROUND(
        CASE 
          WHEN pc.total_quantity > 0 THEN pc.total_amount / pc.total_quantity
          ELSE 0 
        END, 
        2
      ) AS unit_price,
      p.price,
      p.stock,
      p.low_stock_threshold,
      IFNULL(s.times_sold, 0) AS times_sold,
      json_group_array(
        DISTINCT json_object(
          'id', o.id,
          'name', o.name,
          'percentage', po.percentage
        )
      ) AS owners
    FROM 
      products p

    LEFT JOIN purchase_calculations pc ON p.id = pc.product_id
    LEFT JOIN sales_summary s ON p.id = s.product_id
    LEFT JOIN product_owners po ON p.id = po.product_id
    LEFT JOIN owners o ON po.owner_id = o.id

    GROUP BY 
      p.id, p.name, p.category, p.price, p.stock, unit_price, times_sold;
  `;
  const result = (await db.select(query)) as any[];

  const parsed = result.map((row: any) => ({
    ...row,
    owners: JSON.parse(row.owners),
  }));

  return ProductSchema.array().parse(parsed);
}

export default function Products() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: GetProducts,
  });

  return (
    <ProductsTable
      data={data}
      columns={ProductsColumns}
      isLoading={isLoading}
    />
  );
}
