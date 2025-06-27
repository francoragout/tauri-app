import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Purchase } from "../zod";
import { getDb } from "../db";
import { GetBalance } from "./useBalance";
import { combineDateWithCurrentTime, formatDateToSql } from "../utils";

export function CreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Purchase) => {
      const db = await getDb();

      // Validación balance: asegurarse que la compra no supere el balance actual
      const balance = await GetBalance();

      if (values.total > balance) {
        throw new Error("La compra no puede ser mayor que el balance actual");
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
        // 1. Insertar compra
        await db.execute(
          `INSERT INTO purchases (product_id, supplier_id, quantity, total, payment_method, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            values.product_id,
            values.supplier_id,
            values.quantity,
            values.total,
            values.payment_method,
            createdAt,
          ]
        );

        // 2. Actualizar el stock del producto
        await db.execute(
          `UPDATE products
               SET stock = stock + $1
               WHERE id = $2`,
          [values.quantity, values.product_id]
        );

        await db.execute("COMMIT");
      } catch (error) {
        await db.execute("ROLLBACK");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function UpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Purchase) => {
      const db = await getDb();

      // Validación balance: asegurarse que la compra no supere el balance actual
      const balance = await GetBalance();

      if (values.total > balance) {
        throw new Error("La compra no puede ser mayor que el balance actual");
      }

      // Combinar la fecha seleccionada con la hora actual y formatear a SQL
      if (!values.created_at) {
        throw new Error("La fecha de creación es requerida");
      }

      const createdAt = formatDateToSql(
        combineDateWithCurrentTime(new Date(values.created_at))
      );

      // Actualizar la compra
      await db.execute(
        `UPDATE purchases
           SET product_id = $1, supplier_id = $2, quantity = $3, total = $4, payment_method = $5, created_at = $6 WHERE id = $7`,
        [
          values.product_id,
          values.supplier_id,
          values.quantity,
          values.total,
          values.payment_method,
          createdAt,
          values.id,
        ]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function DeletePurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await getDb();

      // Iniciar transacción
      await db.execute("BEGIN TRANSACTION");

      try {
        // 1. Obtener las compras antes de borrarlas para ajustar el stock
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
        const purchases = await db.select<
          {
            id: number;
            product_id: number;
            quantity: number;
          }[]
        >(
          `SELECT id, product_id, quantity FROM purchases WHERE id IN (${placeholders})`,
          ids
        );

        // 2. Revertir el stock
        for (const purchase of purchases) {
          await db.execute(
            `UPDATE products
             SET stock = stock - $1
             WHERE id = $2`,
            [purchase.quantity, purchase.product_id]
          );
        }

        // 3. Eliminar las compras
        await db.execute(
          `DELETE FROM purchases WHERE id IN (${placeholders})`,
          ids
        );

        await db.execute("COMMIT");
      } catch (error) {
        await db.execute("ROLLBACK");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
