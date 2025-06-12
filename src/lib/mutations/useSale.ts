import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sale } from "../zod";
import { getDb } from "../db";

export async function GetSales(): Promise<Sale[]> {
  const db = await getDb();
  return db.select(
    `SELECT id, total, date, datetime(date, '-3 hours') AS local_date FROM sales`
  );
}

function formatDateToSql(date: Date) {
  return date.toISOString().replace("T", " ").substring(0, 19);
}

async function createNotification(
  title: string,
  message: string,
  link: string,
  db: Awaited<ReturnType<typeof getDb>>
) {
  await db.execute(
    `INSERT INTO notifications (title, message, link) VALUES ($1, $2, $3)`,
    [title, message, link]
  );
}

export function CreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Sale) => {
      const db = await getDb();

      await db.execute("BEGIN TRANSACTION");

      try {
        // 1. Verificar stock de los productos
        for (const product of values.products) {
          const result = await db.select<
            {
              stock: number;
              name: string;
              price: number;
              low_stock_threshold: number;
            }[]
          >(
            `SELECT stock, name, price, low_stock_threshold FROM products WHERE id = $1`,
            [product.id]
          );

          if (!result.length)
            throw new Error(`Producto no encontrado: ${product.id}`);

          const { stock, name, price, low_stock_threshold } = result[0];

          if (stock < product.quantity) {
            throw new Error(`Stock insuficiente: ${name}`);
          }

          product.price = price; // lo guardamos para insertar después
          product.name = name;
          product.low_stock_threshold = low_stock_threshold;
          product.stock = stock;
        }

        // 2. Insertar venta
        await db.execute(
          `INSERT INTO sales (payment_method, customer_id, is_paid, total, surcharge, paid_at) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            values.payment_method,
            values.customer_id,
            values.is_paid,
            values.total,
            values.surcharge,
            values.is_paid === 1 ? formatDateToSql(new Date()) : null,
          ]
        );

        const saleIdResult = await db.select<{ id: number }[]>(
          `SELECT last_insert_rowid() as id`
        );

        const saleId = saleIdResult[0].id;

        // 3. Insertar productos y actualizar stock
        for (const product of values.products) {
          await db.execute(
            `INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
            [saleId, product.id, product.quantity, product.price]
          );

          await db.execute(
            `UPDATE products SET stock = stock - $1 WHERE id = $2`,
            [product.quantity, product.id]
          );

          const newStock = (product.stock ?? 0) - product.quantity;

          if (newStock === 0) {
            await createNotification(
              "Sin stock",
              product.name,
              "/products",
              db
            );
          } else if (
            product.low_stock_threshold !== undefined &&
            newStock < product.low_stock_threshold
          ) {
            await createNotification(
              "Stock bajo",
              `Últimas ${newStock} unidades de ${product.name}`,
              "/products",
              db
            );
          }
        }

        await db.execute("COMMIT");
      } catch (error) {
        await db.execute("ROLLBACK");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function DeleteSales() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      if (ids.length === 0) return;

      const db = await getDb();
      await db.execute("BEGIN TRANSACTION");

      try {
        // 1. Obtener productos afectados
        const placeholders = ids.map(() => "?").join(", ");
        const saleProducts = await db.select<
          { product_id: number; quantity: number }[]
        >(
          `SELECT product_id, quantity FROM sale_items WHERE sale_id IN (${placeholders})`,
          ids
        );

        // 2. Revertir stock
        for (const product of saleProducts) {
          await db.execute(
            `UPDATE products SET stock = stock + $1 WHERE id = $2`,
            [product.quantity, product.product_id]
          );
        }

        // 3. Eliminar ventas
        await db.execute(
          `DELETE FROM sales WHERE id IN (${placeholders})`,
          ids
        );

        await db.execute("COMMIT");
      } catch (error) {
        await db.execute("ROLLBACK");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["today_sales"] });
    },
  });
}
