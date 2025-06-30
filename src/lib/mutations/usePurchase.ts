import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Purchase } from "../zod";
import { GetBalance } from "./useBalance";
import { combineDateWithCurrentTime, formatDateToSql } from "../utils";
import Database from "@tauri-apps/plugin-sql";

export function CreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Purchase) => {
      const db = await Database.load("sqlite:mydatabase.db");

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

      try {
        // Iniciar transacción
        await db.execute("BEGIN TRANSACTION");

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
      const db = await Database.load("sqlite:mydatabase.db");

      // Obtener la compra original 
      const originalResult = await db.select<
        { total: number; quantity: number; product_id: number }[]
      >(`SELECT total, quantity, product_id FROM purchases WHERE id = $1`, [
        values.id,
      ]);

      if (originalResult.length === 0) {
        throw new Error("La compra no existe");
      }

      const original = originalResult[0];
      const balance = await GetBalance();
      const availableBalance = balance + original.total;

      if (values.total > availableBalance) {
        throw new Error(
          "La compra no puede ser mayor que el balance disponible"
        );
      }

      if (!values.created_at) {
        throw new Error("La fecha de creación es requerida");
      }

      const createdAt = formatDateToSql(
        combineDateWithCurrentTime(new Date(values.created_at))
      );

      try {
        await db.execute("BEGIN TRANSACTION");

        // 1. Revertir stock si cambió el producto
        if (original.product_id !== values.product_id) {
          await db.execute(
            `UPDATE products SET stock = stock - $1 WHERE id = $2`,
            [original.quantity, original.product_id]
          );
        }

        // 3. Actualizar la compra
        await db.execute(
          `UPDATE purchases
           SET product_id = $1, supplier_id = $2, quantity = $3, total = $4, payment_method = $5, created_at = $6
           WHERE id = $7`,
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

        // 4. Ajustar el stock final
        if (original.product_id !== values.product_id) {
          // Producto cambiado → sumamos nueva cantidad al nuevo producto
          await db.execute(
            `UPDATE products SET stock = stock + $1 WHERE id = $2`,
            [values.quantity, values.product_id]
          );
        } else {
          // Producto igual → ajustamos diferencia
          const quantityDiff = values.quantity - original.quantity;
          if (quantityDiff !== 0) {
            await db.execute(
              `UPDATE products SET stock = stock + $1 WHERE id = $2`,
              [quantityDiff, values.product_id]
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
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function DeletePurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await Database.load("sqlite:mydatabase.db");

      try {
        // Iniciar transacción
        await db.execute("BEGIN TRANSACTION");

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
