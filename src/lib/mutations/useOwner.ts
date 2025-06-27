import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDb } from "../db";
import { Owner } from "../zod";

export async function GetOwners(): Promise<Owner[]> {
  const db = await getDb();
  return db.select(`SELECT * FROM owners`);
}

export function CreateOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Owner) => {
      const db = await getDb();

      // 1. Normalizamos el nombre del propietario para evitar duplicados
      const cleanName = values.name.trim().toLowerCase();

      // 2. Verificamos si ya existe un propietario con ese nombre normalizado
      const existing = await db.select<{ name: string }[]>(
        `SELECT name FROM owners WHERE LOWER(TRIM(name)) = $1`,
        [cleanName]
      );

      // 3. Si existe, lanzamos un error
      if (existing.length > 0) {
        throw new Error("Ya existe un propietario con ese nombre");
      }

      // 4. Si no existe, insertamos el nuevo propietario
      await db.execute(`INSERT INTO owners (name, alias) VALUES ($1, $2)`, [
        values.name,
        values.alias,
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });
}

export function UpdateOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Owner) => {
      const db = await getDb();

      // 1. Normalizamos el nombre del propietario para evitar duplicados
      const cleanName = values.name.trim().toLowerCase();

      // 2. Verificamos si ya existe un propietario con ese nombre normalizado, excluyendo el actual
      const existing = await db.select<{ id: number }[]>(
        `SELECT id FROM owners WHERE LOWER(TRIM(name)) = $1 AND id != $2`,
        [cleanName, values.id]
      );

      // 3. Si existe, lanzamos un error
      if (existing.length > 0) {
        throw new Error("Ya existe un propietario con ese nombre");
      }

      // 4. Si no existe, actualizamos el propietario
      await db.execute(
        `UPDATE owners SET name = $1, alias = $2 WHERE id = $3`,
        [values.name, values.alias, values.id]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });
}

export function DeleteOwners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await getDb();

      // 1. Generamos placeholders para los IDs (ej: $1, $2, ...)
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");

      // 2. Verificamos los propietarios para ver si tienen productos o gastos asociados
      const productCheck = await db.select<{ count: number }[]>(
        `SELECT COUNT(*) as count FROM product_owners WHERE owner_id IN (${placeholders})`,
        ids
      );

      const expenseCheck = await db.select<{ count: number }[]>(
        `SELECT COUNT(*) as count FROM expense_owners WHERE owner_id IN (${placeholders})`,
        ids
      );

      // 3. Sumamos los resultados
      const productCount = productCheck.reduce(
        (acc, row) => acc + row.count,
        0
      );
      const expenseCount = expenseCheck.reduce(
        (acc, row) => acc + row.count,
        0
      );

      // 4. Si hay productos o gastos asociados, lanzamos un error
      if (productCount > 0 && expenseCount > 0) {
        throw new Error(
          "No se pueden eliminar propietarios con productos o gastos asociados"
        );
      } else if (productCount > 0) {
        throw new Error(
          "No se pueden eliminar propietarios con productos asociados"
        );
      } else if (expenseCount > 0) {
        throw new Error(
          "No se pueden eliminar propietarios con gastos asociados"
        );
      }

      // 5. Eliminamos los propietarios seleccionados de la base de datos
      await db.execute(`DELETE FROM owners WHERE id IN (${placeholders})`, ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });
}
