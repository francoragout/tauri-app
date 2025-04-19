import { useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { Sale } from "../zod";

export function CreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Sale) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // 1. Verificar stock de los productos
      for (const item of values.items) {
        const stockResult = await db.select<{ stock: number }[]>(
          `SELECT stock FROM products WHERE id = $1`,
          [item.product_id]
        );

        const stock = stockResult[0]?.stock ?? 0;

        if (stock < item.quantity) {
          // Obtener detalles del producto
          const productResult = await db.select<
            { name: string; variant: string; weight: number }[]
          >(`SELECT name, variant, weight FROM products WHERE id = $1`, [
            item.product_id,
          ]);

          const productName = productResult[0]?.name || "Producto desconocido";
          const productVariant =
            productResult[0]?.variant || "Variante desconocida";
          const productWeight = productResult[0]?.weight || 0;

          throw new Error(
            `Stock insuficiente: ${productName} ${productVariant} ${productWeight} 
            Disponible: ${stock}, requerido: ${item.quantity}`
          );
        }
      }

      // 2. Insertar en sales
      await db.execute(
        `INSERT INTO sales (total, customer_id, is_paid) VALUES ($1, $2, $3)`,
        [values.total, values.customer_id, values.is_paid]
      );

      // 3. Obtener el ID de la venta recién insertada
      const saleIdResult = await db.select<{ id: number }[]>(
        `SELECT last_insert_rowid() as id`
      );

      const saleId = saleIdResult[0].id;

      // 4. Insertar items y actualizar stock
      for (const item of values.items) {
        // Insertar en sale_items
        await db.execute(
          `INSERT INTO sale_items (sale_id, product_id, quantity) VALUES ($1, $2, $3)`,
          [saleId, item.product_id, item.quantity]
        );

        // Actualizar el stock del producto
        await db.execute(
          `UPDATE products SET stock = stock - $1 WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
