import { useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { Product } from "../zod";

export function GetProducts(): Promise<Product[]> {
  return Database.load("sqlite:mydatabase.db").then((db) =>
    db.select(`SELECT * FROM products`)
  );
}

export function CreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Product) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // Normaliza el nombre: elimina espacios y convierte a minúsculas
      const cleanName = values.name.trim().toLowerCase();

      // Verifica si ya existe un producto con ese nombre normalizado
      const existing = await db.select<{ id: number }[]>(
        `SELECT id FROM products WHERE LOWER(TRIM(name)) = $1`,
        [cleanName]
      );

      if (existing.length > 0) {
        throw new Error("Ya existe un producto con ese nombre");
      }

      // 1. Insertar producto
      await db.execute(
        `INSERT INTO products (name, category, price, stock)
         VALUES ($1, $2, $3, $4)`,
        [values.name, values.category, values.price, values.stock]
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

      // Normaliza el nombre: elimina espacios y convierte a minúsculas
      const cleanName = values.name.trim().toLowerCase();

      // Verifica si ya existe un producto con ese nombre normalizado, excepto el actual
      const existing = await db.select<{ id: number }[]>(
        `SELECT id FROM products WHERE LOWER(TRIM(name)) = $1 AND id != $2`,
        [cleanName, values.id]
      );

      if (existing.length > 0) {
        throw new Error("Ya existe un producto con ese nombre");
      }

      // 1. Actualizar producto
      await db.execute(
        `UPDATE products 
         SET name = $1, category = $2, price = $3, stock = $4 
         WHERE id = $5`,
        [values.name, values.category, values.price, values.stock, values.id]
      );

      // 2. Eliminar dueños existentes
      await db.execute(`DELETE FROM product_owners WHERE product_id = $1`, [
        values.id,
      ]);

      // 3. Insertar nuevos dueños y porcentajes
      for (const owner of values.owners) {
        await db.execute(
          `INSERT INTO product_owners (product_id, owner_id, percentage)
           VALUES ($1, $2, $3)`,
          [values.id, owner.id, owner.percentage]
        );
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
      const placeholders = ids.map(() => "?").join(",");

      // Verificar si los productos seleccionados tienen compras asociadas
      const purchases = await db.select<{ product_id: number }[]>(
        `SELECT product_id FROM purchases WHERE product_id IN (${placeholders})`,
        ids
      );

      if (purchases.length > 0) {
        throw new Error(
          "No se pueden eliminar productos con compras asociadas"
        );
      }

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

