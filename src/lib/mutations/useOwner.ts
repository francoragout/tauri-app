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

      // Verificar si el propietario tiene productos
      const productCheck = await db.select<{ count: number }[]>(
        `SELECT COUNT(*) as count FROM product_owners WHERE owner_id IN (${placeholders})`,
        ids
      );

      const totalProductCount = productCheck.reduce(
        (acc, row) => acc + row.count,
        0
      );

      if (totalProductCount > 0) {
        throw new Error(
          "No se puede eliminar un propietario con productos asociados"
        );
      }

      // Verificar si el propietario tiene expensas
      const expenseCheck = await db.select<{ count: number }[]>(
        `SELECT COUNT(*) as count FROM expense_owners WHERE owner_id IN (${placeholders})`,
        ids
      );

      const totalExpenseCount = expenseCheck.reduce(
        (acc, row) => acc + row.count,
        0
      );

      if (totalExpenseCount > 0) {
        throw new Error(
          "No se puede eliminar un propietario con expensas asociadas"
        );
      }

      // Si no hay asociaciones, eliminar
      await db.execute(`DELETE FROM owners WHERE id IN (${placeholders})`, ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });
}
