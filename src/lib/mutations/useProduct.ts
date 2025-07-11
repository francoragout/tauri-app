import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "../zod";
import { getDb } from "../db";
import Database from "@tauri-apps/plugin-sql";

export async function GetProducts(): Promise<Product[]> {
  const db = await getDb();
  return db.select(`SELECT id, name FROM products;`);
}

export function CreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Product) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // Validación duplicados: asegurar que no exista un producto con el mismo nombre
      const cleanName = values.name.trim().toLowerCase();

      const existing = await db.select<{ id: number }[]>(
        `SELECT id FROM products WHERE LOWER(TRIM(name)) = $1`,
        [cleanName]
      );

      if (existing.length > 0) {
        throw new Error("Ya existe un producto con ese nombre");
      }

      // Iniciar transacción
      await db.execute("BEGIN TRANSACTION");

      try {
        // 1. Insertar producto y obtener su ID
        const [{ id: product_id }] = await db.select<{ id: number }[]>(
          `INSERT INTO products (name, category, price, stock, low_stock_threshold)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [
            values.name,
            values.category,
            values.price,
            values.stock,
            values.low_stock_threshold,
          ]
        );

        // 2. Insertar los propietarios y su porcentaje
        for (const owner of values.owners) {
          await db.execute(
            `INSERT INTO product_owners (product_id, owner_id, percentage)
             VALUES ($1, $2, $3)`,
            [product_id, owner.id, owner.percentage]
          );
        }

        // Confirmar transacción
        await db.execute("COMMIT");
      } catch (error) {
        // Si ocurre un error, revertir la transacción
        await db.execute("ROLLBACK");
        throw error;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function UpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Product) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // Validación duplicados: asegurar que no exista un producto con el mismo nombre
      const cleanName = values.name.trim().toLowerCase();

      const existing = await db.select<{ id: number }[]>(
        `SELECT id FROM products WHERE LOWER(TRIM(name)) = $1 AND id != $2`,
        [cleanName, values.id]
      );

      if (existing.length > 0) {
        throw new Error("Ya existe un producto con ese nombre");
      }

      // Iniciar transacción
      await db.execute("BEGIN TRANSACTION");

      try {
        // 1. Actualizar producto
        await db.execute(
          `UPDATE products 
           SET name = $1, category = $2, price = $3, stock = $4, low_stock_threshold = $5 
           WHERE id = $6`,
          [
            values.name,
            values.category,
            values.price,
            values.stock,
            values.low_stock_threshold,
            values.id,
          ]
        );

        // 2. Eliminar dueños existentes
        await db.execute(`DELETE FROM product_owners WHERE product_id = $1`, [
          values.id,
        ]);

        // 3. Insertar nuevos dueños
        for (const owner of values.owners) {
          await db.execute(
            `INSERT INTO product_owners (product_id, owner_id, percentage)
             VALUES ($1, $2, $3)`,
            [values.id, owner.id, owner.percentage]
          );
        }

        await db.execute("COMMIT");
      } catch (error) {
        await db.execute("ROLLBACK");
        throw error;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function DeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await Database.load("sqlite:mydatabase.db");
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");

      // 1. Verificar si los productos tienen compras o ventas asociadas
      const [purchaseCount, saleCount] = await Promise.all([
        db.select<{ count: number }[]>(
          `SELECT COUNT(*) as count FROM purchases WHERE product_id IN (${placeholders})`,
          ids
        ),
        db.select<{ count: number }[]>(
          `SELECT COUNT(*) as count FROM sale_items WHERE product_id IN (${placeholders})`,
          ids
        ),
      ]);

      const pCount = purchaseCount[0].count;
      const sCount = saleCount[0].count;

      if (pCount > 0 && sCount > 0) {
        throw new Error(
          "No se pueden eliminar productos con compras y ventas asociadas"
        );
      } else if (pCount > 0) {
        throw new Error(
          "No se pueden eliminar productos con compras asociadas"
        );
      } else if (sCount > 0) {
        throw new Error("No se pueden eliminar productos con ventas asociadas");
      }

      // Eliminar los productos
      await db.execute(
        `DELETE FROM products WHERE id IN (${placeholders})`,
        ids
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
