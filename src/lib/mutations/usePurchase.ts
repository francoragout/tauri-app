import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Purchase } from "../zod";
import { getDb } from "../db";
import { GetBalance } from "./useBalance";

export function CreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Purchase) => {
      const db = await getDb();

      // 1. Obtener el balance actual
      const balance = await GetBalance();

      // 2. Verificar si la compra supera el balance actual
      if (values.total > balance) {
        throw new Error("La compra no puede ser mayor que el balance actual");
      }

      // 3. Insertar compra
      await db.execute(
        `INSERT INTO purchases (product_id, supplier_id, quantity, total, payment_method)
           VALUES ($1, $2, $3, $4, $5)`,
        [
          values.product_id,
          values.supplier_id,
          values.quantity,
          values.total,
          values.payment_method,
        ]
      );

      // 4. Editar stock del producto
      await db.execute(
        `UPDATE products
             SET stock = stock + $1
             WHERE id = $2`,
        [values.quantity, values.product_id]
      );
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

      // 1. Obtener el balance actual
      const balance = await GetBalance();

      // 2. Verificar si la compra supera el balance actual
      if (values.total > balance) {
        throw new Error("La compra no puede ser mayor que el balance actual");
      }

      // 3. Actualizar compra
      await db.execute(
        `UPDATE purchases
           SET product_id = $1, supplier_id = $2, quantity = $3, total = $4, payment_method = $5
           WHERE id = $6`,
        [
          values.product_id,
          values.supplier_id,
          values.quantity,
          values.total,
          values.payment_method,
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

      await db.execute(`DELETE FROM purchases WHERE id IN (${ids.join(",")})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
