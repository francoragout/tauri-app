import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sale } from "../zod";
import { getDb } from "../db";
import { combineDateWithCurrentTime, formatDateToSql } from "../utils";
import { createNotification } from "./useNotification";

export function CreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Sale) => {
      const db = await getDb();

      // Validación extra: asegurarse que ningún producto tenga valores nulos o inválidos
      const invalidProduct = values.products.some(
        (product) =>
          product.id == null ||
          product.name == null ||
          product.quantity == null ||
          typeof product.id !== "number" ||
          typeof product.quantity !== "number"
      );

      if (invalidProduct) {
        throw new Error("Hay productos con datos inválidos.");
      }

      // Verificar stock: asegurarse que todos los productos existen y tienen suficiente stock

      for (const product of values.products) {
        const result = await db.select<
          { id: number; name: string; stock: number }[]
        >(`SELECT id, name, stock FROM products WHERE id = $1`, [product.id]);

        const dbProduct = result[0];

        if (!dbProduct) {
          throw new Error(`Producto no encontrado (ID: ${product.id})`);
        }

        if (dbProduct.stock < product.quantity) {
          throw new Error(`Stock insuficiente: ${dbProduct.name}`);
        }
      }

      // Combinar la fecha seleccionada con la hora actual y formatear a SQL
      if (!values.created_at) {
        throw new Error("La fecha de creación es requerida");
      }

      const createdAt = formatDateToSql(
        combineDateWithCurrentTime(new Date(values.created_at))
      );

      // Iniciar transacción
      await db.execute("BEGIN TRANSACTION");

      try {
        // 1. Insertar venta
        await db.execute(
          `INSERT INTO sales (payment_method, customer_id, total, paid_at, created_at) VALUES ($1, $2, $3, $4, $5)`,
          [
            values.payment_method,
            values.customer_id,
            values.customer_id ? 0 : values.total,
            values.customer_id ? null : createdAt,
            createdAt,
          ]
        );

        const saleIdResult = await db.select<{ id: number }[]>(
          `SELECT last_insert_rowid() as id`
        );

        const saleId = saleIdResult[0].id;

        for (const product of values.products) {
          // 2. Insertar item de la venta
          await db.execute(
            `INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
            [saleId, product.id, product.quantity, product.price]
          );

          // 3. Actualizar stock
          await db.execute(
            `UPDATE products SET stock = stock - $1 WHERE id = $2`,
            [product.quantity, product.id]
          );

          // 4. Obtener nuevo stock y low_stock_threshold desde la DB
          const [updatedProduct] = await db.select<
            {
              stock: number;
              name: string;
              low_stock_threshold: number;
            }[]
          >(
            `SELECT stock, name, low_stock_threshold FROM products WHERE id = $1`,
            [product.id]
          );

          const newStock = updatedProduct.stock;
          const name = updatedProduct.name;
          const threshold = updatedProduct.low_stock_threshold ?? 0;

          // 5. Crear notificaciones si corresponde
          if (newStock === 0) {
            await createNotification("Sin Stock", name, "/products", db);
          } else if (newStock < threshold) {
            await createNotification(
              "Últimas Unidades",
              `${name} (${newStock} restantes)`,
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
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["daily_financial_report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly_financial_report"] });
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
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
