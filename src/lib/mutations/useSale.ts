import { useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { Sale } from "../zod";

export function CreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Sale) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // 1. Insertar en sales
      await db.execute(`INSERT INTO sales (total) VALUES ($1)`, [values.total]);

      // 2. Obtener el ID de la venta recién insertada
      const saleIdResult = await db.select<{ id: number }[]>(
        `SELECT last_insert_rowid() as id`
      );

      const saleId = saleIdResult[0].id;

      // 3. Insertar items
      for (const item of values.items) {
        await db.execute(
          `INSERT INTO sale_items (sale_id, product_id, quantity) VALUES ($1, $2, $3)`,
          [saleId, item.product_id, item.quantity]
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}
