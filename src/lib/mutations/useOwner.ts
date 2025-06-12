import Database from "@tauri-apps/plugin-sql";
import { Owner } from "../zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function GetOwners(): Promise<Owner[]> {
  return Database.load("sqlite:mydatabase.db").then((db) =>
    db.select(`SELECT * FROM owners`)
  );
}

export function CreateOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Owner) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO owners (name)
             VALUES ($1)`,
        [values.name]
      );
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
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(`UPDATE owners SET name = $1 WHERE id = $2`, [
        values.name,
        values.id,
      ]);
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
      const db = await Database.load("sqlite:mydatabase.db");
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
