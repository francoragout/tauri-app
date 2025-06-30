import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bill, Sale } from "../zod";
import { combineDateWithCurrentTime, formatDateToSql } from "../utils";
import { createNotification } from "./useNotification";
import Database from "@tauri-apps/plugin-sql";

export function CreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Sale) => {
      const db = await Database.load("sqlite:mydatabase.db");

      if (!values.created_at) {
        throw new Error("La fecha de creación es requerida");
      }

      const createdAt = formatDateToSql(
        combineDateWithCurrentTime(new Date(values.created_at))
      );

      // Validar stock de cada producto
      for (const product of values.products) {
        const [dbProduct] = await db.select<
          { id: number; name: string; stock: number }[]
        >(`SELECT id, name, stock FROM products WHERE id = $1`, [product.id]);

        if (!dbProduct) {
          throw new Error(`Producto no encontrado (ID: ${product.id})`);
        }

        if (dbProduct.stock < product.quantity) {
          throw new Error(`Stock insuficiente: ${dbProduct.name}`);
        }
      }

      try {
        // Iniciar transacción
        await db.execute("BEGIN TRANSACTION");

        // 1. Insertar venta
        const [{ id: sale_id }] = await db.select<{ id: number }[]>(
          `INSERT INTO sales (payment_method, customer_id, total, paid_at, created_at)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [
            values.payment_method,
            values.customer_id,
            values.customer_id ? 0 : values.total,
            values.customer_id ? null : createdAt,
            createdAt,
          ]
        );

        // 2. Registrar productos vendidos
        for (const product of values.products) {
          await db.execute(
            `INSERT INTO sale_items (sale_id, product_id, quantity, price)
             VALUES ($1, $2, $3, $4)`,
            [sale_id, product.id, product.quantity, product.price]
          );

          // 3. Actualizar stock del producto
          await db.execute(
            `UPDATE products SET stock = stock - $1 WHERE id = $2`,
            [product.quantity, product.id]
          );

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

          const { stock, name, low_stock_threshold } = updatedProduct;

          if (stock === 0) {
            await createNotification("Sin Stock", name, "/products", db);
          } else if (stock < (low_stock_threshold ?? 0)) {
            await createNotification(
              "Últimas Unidades",
              `${name} (${stock} restantes)`,
              "/products",
              db
            );
          }
        }

        // 5. Confirmar transacción
        await db.execute("COMMIT");
      } catch (error) {
        await db.execute("ROLLBACK");
        throw error;
      }
    },

    onSuccess: () => {
      const keys = [
        "sales",
        "balance",
        "bills",
        "products",
        "notifications",
        "daily_financial_report",
        "monthly_financial_report",
      ];

      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
  });
}

export function UpdateSales() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Bill) => {
      const db = await Database.load("sqlite:mydatabase.db");

      if (!values.sales_summary.length) {
        throw new Error("No hay ventas seleccionadas para actualizar.");
      }

      try {
        const formattedDate = formatDateToSql(new Date());

        await db.execute("BEGIN TRANSACTION");

        for (const sale of values.sales_summary) {
          // Aplicar recargo si no es "cash"
          const surcharge =
            values.payment_method !== "cash" ? sale.total * 0.05 : 0;

          const totalWithSurcharge = sale.total + surcharge;

          await db.execute(
            `UPDATE sales
             SET paid_at = $1, payment_method = $2, total = $3
             WHERE id = $4`,
            [
              formattedDate,
              values.payment_method,
              totalWithSurcharge,
              sale.sale_id,
            ]
          );
        }

        await db.execute("COMMIT");
      } catch (error) {
        await db.execute("ROLLBACK");
        throw error;
      }
    },

    onSuccess: () => {
      const keys = ["bills", "balance", "sales"];
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
  });
}

export function DeleteSales() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      if (ids.length === 0) return;

      const db = await Database.load("sqlite:mydatabase.db");
      await db.execute("BEGIN TRANSACTION");

      try {
        // 1. Obtener productos afectados y sus cantidades
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
        const saleItems = await db.select<
          { product_id: number; quantity: number }[]
        >(
          `SELECT product_id, quantity FROM sale_items WHERE sale_id IN (${placeholders})`,
          ids
        );

        // 2. Revertir stock por cada producto involucrado
        for (const { product_id, quantity } of saleItems) {
          await db.execute(
            `UPDATE products SET stock = stock + $1 WHERE id = $2`,
            [quantity, product_id]
          );
        }

        // 3. Eliminar las ventas
        await db.execute(
          `DELETE FROM sales WHERE id IN (${placeholders})`,
          ids
        );

        // 4. Confirmar transacción
        await db.execute("COMMIT");
      } catch (error) {
        await db.execute("ROLLBACK");
        throw error;
      }
    },
    onSuccess: () => {
      const keys = ["sales", "balance", "products"];
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
  });
}
