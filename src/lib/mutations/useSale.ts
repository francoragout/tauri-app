import { useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { MonthlySales, MonthlySalesSchema, Sale } from "../zod";

export function GetSales(): Promise<Sale[]> {
  return Database.load("sqlite:mydatabase.db").then((db) =>
    db.select(
      `SELECT id, total, date, datetime(date, '-3 hours') AS local_date FROM sales`
    )
  );
}

export function CreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Sale) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // 1. Verificar stock de los productos
      for (const product of values.products) {
        const stockResult = await db.select<{ stock: number }[]>(
          `SELECT stock FROM products WHERE id = $1`,
          [product.id]
        );

        const stock = stockResult[0]?.stock ?? 0;

        if (stock < product.quantity) {
          // Obtener detalles del producto
          const productResult = await db.select<{ name: string }[]>(
            `SELECT name FROM products WHERE id = $1`,
            [product.id]
          );

          const productBrand = productResult[0]?.name;

          throw new Error(`Stock insuficiente: ${productBrand}`);
        }
      }

      // 2. Insertar en sales
      await db.execute(
        `INSERT INTO sales (payment_method, customer_id, is_paid, total, surcharge) VALUES ($1, $2, $3, $4, $5)`,
        [
          values.payment_method,
          values.customer_id,
          values.is_paid,
          values.total,
          values.surcharge,
        ]
      );

      // 3. Obtener el ID de la venta recién insertada
      const saleIdResult = await db.select<{ id: number }[]>(
        `SELECT last_insert_rowid() as id`
      );

      const saleId = saleIdResult[0].id;

      // 4. Insertar products y actualizar stock
      for (const product of values.products) {
        // Obtener el precio actual del producto
        const priceResult = await db.select<{ price: number }[]>(
          `SELECT price FROM products WHERE id = $1`,
          [product.id]
        );

        const productPrice = priceResult[0].price;

        // Insertar en sale_items con el precio actual
        await db.execute(
          `INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
          [saleId, product.id, product.quantity, productPrice]
        );

        // Actualizar el stock del producto
        await db.execute(
          `UPDATE products SET stock = stock - $1 WHERE id = $2`,
          [product.quantity, product.id]
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["today_sales"] });
      queryClient.invalidateQueries({ queryKey: ["month_sales"] });
    },
  });
}

export function DeleteSales() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // 1. Recuperar los productos y cantidades de las ventas
      const saleProducts = await db.select<
        { product_id: number; quantity: number }[]
      >(
        `SELECT product_id, quantity FROM sale_items WHERE sale_id IN (${ids.join(
          ","
        )})`
      );

      // 2. Revertir el stock de los productos
      for (const product of saleProducts) {
        await db.execute(
          `UPDATE products SET stock = stock + $1 WHERE id = $2`,
          [product.quantity, product.product_id]
        );
      }

      // 3. Eliminar las ventas
      await db.execute(`DELETE FROM sales WHERE id IN (${ids.join(",")})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["today_sales"] });
      queryClient.invalidateQueries({ queryKey: ["today_sales"] });
    },
  });
}

export async function GetMonthlySalesByCustomerId(
  id: number
): Promise<MonthlySales[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
SELECT
  s.customer_id AS customer_id,
  strftime('%Y-%m', datetime(s.date, '-3 hours')) AS period,
  json_group_array(
    json_object(
      'id', s.id,
      'date', datetime(s.date, '-3 hours'),
      'total', sale_total
    )
  ) AS sales_summary,
  SUM(sale_total) AS debt
FROM sales s
JOIN (
  SELECT
    sale_id,
    SUM(quantity * price) AS sale_total
  FROM sale_items
  GROUP BY sale_id
) AS totals ON totals.sale_id = s.id
WHERE s.customer_id = $1
  AND s.is_paid = 0
GROUP BY s.customer_id, period
ORDER BY period;
  `;
  const result = (await db.select(query, [id])) as any[];

  const parsed = result.map((row: any) => ({
    ...row,
    sales_summary: JSON.parse(row.sales_summary),
  }));

  return MonthlySalesSchema.array().parse(parsed);
}
