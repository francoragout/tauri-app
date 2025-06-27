import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "../zod";
import { getDb } from "../db";

export async function GetProducts(): Promise<Product[]> {
  const db = await getDb();
  return db.select(`SELECT id, name FROM products;`);
}

export function CreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Product) => {
      const db = await getDb();

      // Validación extra: asegurarse que ningún owner tenga valores nulos o inválidos
      const invalidOwner = values.owners.some(
        (owner) =>
          owner.id == null ||
          owner.name == null ||
          owner.percentage == null ||
          typeof owner.id !== "number" ||
          typeof owner.percentage !== "number"
      );

      if (invalidOwner) {
        throw new Error("Hay propietarios con datos inválidos.");
      }

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
        // 1. Insertar producto
        await db.execute(
          `INSERT INTO products (name, category, price, stock, low_stock_threshold)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            values.name,
            values.category,
            values.price,
            values.stock,
            values.low_stock_threshold,
          ]
        );

        // 2. Obtener el id del producto recién creado
        const [{ id: product_id }] = await db.select<{ id: number }[]>(
          `SELECT last_insert_rowid() as id`
        );

        // 3. Insertar dueños y porcentajes
        for (const owner of values.owners) {
          await db.execute(
            `INSERT INTO product_owners (product_id, owner_id, percentage)
             VALUES ($1, $2, $3)`,
            [product_id, owner.id, owner.percentage]
          );
        }

        // Confirmar los cambios
        await db.execute("COMMIT");
      } catch (error) {
        // Revertir los cambios
        await db.execute("ROLLBACK");
        throw error; // Relanzar el error para que lo capture el useMutation
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
      const db = await getDb();

      // Validación extra: asegurarse que ningún owner tenga valores nulos o inválidos
      const invalidOwner = values.owners.some(
        (owner) =>
          owner.id == null ||
          owner.name == null ||
          owner.percentage == null ||
          typeof owner.id !== "number" ||
          typeof owner.percentage !== "number"
      );

      if (invalidOwner) {
        throw new Error("Hay propietarios con datos inválidos.");
      }

      const cleanName = values.name.trim().toLowerCase();

      // Validación duplicados: asegurar que no exista un producto con el mismo nombre
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
      const db = await getDb();
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");

      // Verificar si los productos seleccionados tienen compras o ventas asociadas
      const purchases = await db.select<{ product_id: number }[]>(
        `SELECT product_id FROM purchases WHERE product_id IN (${placeholders})`,
        ids
      );
      const sales = await db.select<{ product_id: number }[]>(
        `SELECT product_id FROM sale_items WHERE product_id IN (${placeholders})`,
        ids
      );

      if (purchases.length > 0 && sales.length > 0) {
        throw new Error(
          "No se pueden eliminar productos con compras y ventas asociadas"
        );
      } else if (purchases.length > 0) {
        throw new Error(
          "No se pueden eliminar productos con compras asociadas"
        );
      } else if (sales.length > 0) {
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
