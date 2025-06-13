import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense } from "../zod";
import { getDb } from "../db";
import { GetBalance } from "./useBalance";

export function CreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Expense) => {
      const db = await getDb();

      // 1. Obtener el balance actual
      const balance = await GetBalance();

      // 2. Verificar si el gasto supera el balance actual
      if (values.amount > balance) {
        throw new Error("El gasto no puede ser mayor que el balance actual");
      }

      // 3. Insertar gasto
      await db.execute(
        `INSERT INTO expenses (category, description, amount)
           VALUES ($1, $2, $3)`,
        [values.category, values.description, values.amount]
      );

      // 4. Obtener el id del gasto recién creado
      const [{ id: expense_id }] = await db.select<{ id: number }[]>(
        `SELECT last_insert_rowid() as id`
      );

      // 5. Insertar dueños y porcentajes
      for (const owner of values.owners) {
        await db.execute(
          `INSERT INTO expense_owners (expense_id, owner_id, percentage)
           VALUES ($1, $2, $3)`,
          [expense_id, owner.id, owner.percentage]
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function UpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Expense) => {
      const db = await getDb();

      // 1. Obtener el balance actual
      const balance = await GetBalance();

      // 2. Verificar si el gasto supera el balance actual
      if (values.amount > balance) {
        throw new Error("El gasto no puede ser mayor que el balance actual");
      }

      // 3. Actualizar gasto
      await db.execute(
        `UPDATE expenses
           SET category = $1, description = $2, amount = $3
           WHERE id = $4`,
        [values.category, values.description, values.amount, values.id]
      );

      // 4. Eliminar dueños existentes
      await db.execute(`DELETE FROM expense_owners WHERE expense_id = $1`, [
        values.id,
      ]);

      // 5. Insertar nuevos dueños y porcentajes
      for (const owner of values.owners) {
        await db.execute(
          `INSERT INTO expense_owners (expense_id, owner_id, percentage)
           VALUES ($1, $2, $3)`,
          [values.id, owner.id, owner.percentage]
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function DeleteExpenses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await getDb();

      await db.execute(`DELETE FROM expenses WHERE id IN (${ids.join(",")})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
