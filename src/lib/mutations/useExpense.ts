import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense } from "../zod";
import { combineDateWithCurrentTime, formatDateToSql } from "../utils";
import { GetBalance } from "./useBalance";
import Database from "@tauri-apps/plugin-sql";

export function CreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Expense) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // Validación balance: asegurarse que el gasto no supere el balance actual
      const balance = await GetBalance();

      if (values.amount > balance) {
        throw new Error("La compra no puede ser mayor que el balance actual");
      }

      // Combinar la fecha seleccionada con la hora actual y formatear a SQL
      if (!values.created_at) {
        throw new Error("La fecha de creación es requerida");
      }

      const createdAt = formatDateToSql(
        combineDateWithCurrentTime(new Date(values.created_at))
      );

      // Iniciar transacción
      await db.execute("BEGIN TRANSACTION");

      try {
        // 1. Insertar gasto y obtener su ID
        const [{ id: expense_id }] = await db.select<{ id: number }[]>(
          `INSERT INTO expenses (created_at, description, amount, payment_method)
             VALUES ($1, $2, $3, $4) RETURNING id`,
          [createdAt, values.description, values.amount, values.payment_method]
        );

        // 2. Insertar los propietarios y su porcentaje
        for (const owner of values.owners) {
          await db.execute(
            `INSERT INTO expense_owners (expense_id, owner_id, percentage)
               VALUES ($1, $2, $3)`,
            [expense_id, owner.id, owner.percentage]
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
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function UpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: Expense) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // Validación balance: asegurarse que el gasto no supere el balance actual
      const balance = await GetBalance();

      if (values.amount > balance) {
        throw new Error("La compra no puede ser mayor que el balance actual");
      }

      // Combinar la fecha seleccionada con la hora actual y formatear a SQL
      if (!values.created_at) {
        throw new Error("La fecha de creación es requerida");
      }

      const createdAt = formatDateToSql(
        combineDateWithCurrentTime(new Date(values.created_at))
      );

      // Iniciar transacción

      await db.execute("BEGIN TRANSACTION");

      try {
        // 1. Actualizar el gasto
        await db.execute(
          `UPDATE expenses
             SET created_at = $1, description = $2, amount = $3, payment_method = $4
             WHERE id = $5`,
          [
            createdAt,
            values.description,
            values.amount,
            values.payment_method,
            values.id,
          ]
        );

        // 2. Verificar si los propietarios cambiaron
        const existingOwners = await db.select<
          { owner_id: number; percentage: number }[]
        >(
          `SELECT owner_id, percentage FROM expense_owners WHERE expense_id = $1 ORDER BY owner_id`,
          [values.id]
        );

        // 3. Comparar propietarios existentes con los nuevos
        const newOwners = [...values.owners].sort((a, b) => a.id - b.id);
        const ownersChanged =
          existingOwners.length !== newOwners.length ||
          existingOwners.some(
            (existing, index) =>
              existing.owner_id !== newOwners[index].id ||
              existing.percentage !== newOwners[index].percentage
          );

        // 3. Solo actualizar propietarios si cambiaron
        if (ownersChanged) {
          // Eliminar los propietarios existentes
          await db.execute(`DELETE FROM expense_owners WHERE expense_id = $1`, [
            values.id,
          ]);

          // Insertar los nuevos propietarios y su porcentaje
          for (const owner of values.owners) {
            await db.execute(
              `INSERT INTO expense_owners (expense_id, owner_id, percentage)
           VALUES ($1, $2, $3)`,
              [values.id, owner.id, owner.percentage]
            );
          }
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
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function DeleteExpenses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await Database.load("sqlite:mydatabase.db");

      const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
      await db.execute(
        `DELETE FROM expenses WHERE id IN (${placeholders})`,
        ids
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
