import { Owner } from "../zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDb } from "../db";

export async function GetOwners(): Promise<Owner[]> {
  const db = await getDb();
  return db.select(`SELECT * FROM owners`);
}

export function CreateOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Owner) => {
      const db = await getDb();

      // Normalizamos el nombre y alias para validar duplicados
      const cleanName = values.name.trim().toLowerCase();
      const cleanAlias = values.alias?.trim().toLowerCase() ?? null;

      // Buscar si ya existe otro owner con el mismo nombre o alias
      const existing = await db.select<
        { name: string; alias: string | null }[]
      >(
        `SELECT name, alias FROM owners
         WHERE LOWER(name) = $1 OR LOWER(alias) = $2`,
        [cleanName, cleanAlias ?? ""]
      );

      const nameExists = existing.some(
        (row) => row.name.trim().toLowerCase() === cleanName
      );
      const aliasExists = cleanAlias
        ? existing.some(
            (row) =>
              row.alias !== null &&
              row.alias.trim().toLowerCase() === cleanAlias
          )
        : false;

      if (nameExists && aliasExists) {
        throw new Error("Ya existe un propietario con ese nombre y alias");
      } else if (nameExists) {
        throw new Error("Ya existe un propietario con ese nombre");
      } else if (aliasExists) {
        throw new Error("Ya existe un propietario con ese alias");
      }

      // Insertar los valores tal como vienen (sin normalizar)
      await db.execute(`INSERT INTO owners (name, alias) VALUES ($1, $2)`, [
        values.name,
        values.alias ?? null,
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

      // Normalizamos para validar duplicados
      const cleanName = values.name.trim().toLowerCase();
      const cleanAlias = values.alias?.trim().toLowerCase() ?? null;

      // Buscar si ya existe otro owner con el mismo nombre o alias (excluyendo el actual)
      const existing = await db.select<
        { id: number; name: string; alias: string | null }[]
      >(
        `SELECT id, name, alias FROM owners
         WHERE id != $1 AND (LOWER(name) = $2 OR LOWER(alias) = $3)`,
        [values.id, cleanName, cleanAlias ?? ""]
      );

      const nameExists = existing.some(
        (row) => row.name.trim().toLowerCase() === cleanName
      );
      const aliasExists = cleanAlias
        ? existing.some(
            (row) =>
              row.alias !== null &&
              row.alias.trim().toLowerCase() === cleanAlias
          )
        : false;

      if (nameExists && aliasExists) {
        throw new Error("Ya existe otro propietario con ese nombre y alias");
      } else if (nameExists) {
        throw new Error("Ya existe otro propietario con ese nombre");
      } else if (aliasExists) {
        throw new Error("Ya existe otro propietario con ese alias");
      }

      // Guardamos los datos tal como fueron ingresados
      await db.execute(
        `UPDATE owners SET name = $1, alias = $2 WHERE id = $3`,
        [values.name, values.alias ?? null, values.id]
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
      const placeholders = ids.map(() => "?").join(",");

      // Verificar si el propietario tiene productos o gastos asociadas
      const productCheck = await db.select<{ count: number }[]>(
        `SELECT owner_id FROM product_owners WHERE owner_id IN (${placeholders})`,
        ids
      );

      const expenseCheck = await db.select<{ count: number }[]>(
        `SELECT owner_id FROM expense_owners WHERE owner_id IN (${placeholders})`,
        ids
      );

      if (productCheck.length > 0 && expenseCheck.length > 0) {
        throw new Error(
          "No se pueden eliminar propietarios con productos o gastos asociados"
        );
      } else if (productCheck.length > 0) {
        throw new Error(
          "No se pueden eliminar propietarios con productos asociados"
        );
      } else if (expenseCheck.length > 0) {
        throw new Error(
          "No se pueden eliminar propietarios con gastos asociados"
        );
      }

      // Eliminar los propietarios
      await db.execute(`DELETE FROM owners WHERE id IN (${placeholders})`, ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });
}
