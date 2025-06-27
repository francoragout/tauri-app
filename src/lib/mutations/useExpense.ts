import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense } from "../zod";
import { getDb } from "../db";
import { GetBalance } from "./useBalance";
import { combineDateWithCurrentTime, formatDateToSql } from "../utils";

export function CreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Expense) => {
      const db = await getDb();

      // Validar balance
      const balance = await GetBalance();
      if (values.amount > balance) {
        throw new Error("El gasto no puede ser mayor que el balance actual");
      }

      // Validar fecha
      if (!values.created_at) {
        throw new Error("La fecha de creación es requerida");
      }

      const createdAt = formatDateToSql(
        combineDateWithCurrentTime(new Date(values.created_at))
      );

      // Iniciar transacción
      await db.execute("BEGIN TRANSACTION");

      try {
        // 1. Insertar el gasto y obtener su ID
        const [{ id: expense_id }] = await db.select<{ id: number }[]>(
          `INSERT INTO expenses (description, amount, payment_method, created_at)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [values.description, values.amount, values.payment_method, createdAt]
        );

        for (const owner of values.owners) {
          // 2. Insertar los propietarios del gasto
          await db.execute(
            `INSERT INTO expense_owners (expense_id, owner_id, percentage)
             VALUES ($1, $2, $3)`,
            [expense_id, owner.id, owner.percentage]
          );
        }

        // Confirmar transacción
        await db.execute("COMMIT");
      } catch (error) {
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
      const db = await getDb();

      // Validar que el ID del gasto esté presente
      if (!values.id) {
        throw new Error("El ID del gasto es requerido para actualizar");
      }

      // Obtener el gasto actual para comparar con el nuevo monto
      const [currentExpense] = await db.select<{ amount: number }[]>(
        `SELECT amount FROM expenses WHERE id = $1`,
        [values.id]
      );

      if (!currentExpense) {
        throw new Error("El gasto no existe");
      }

      // Validar balance considerando el gasto actual
      const balance = await GetBalance();
      const balanceWithCurrentExpense = balance + currentExpense.amount;

      if (values.amount > balanceWithCurrentExpense) {
        throw new Error(
          "El gasto no puede ser mayor que el balance disponible"
        );
      }

      // Validar fecha
      if (!values.created_at) {
        throw new Error("La fecha de creación es requerida");
      }

      const createdAt = formatDateToSql(
        combineDateWithCurrentTime(new Date(values.created_at))
      );

      // Validar owners
      if (
        !values.owners ||
        values.owners.length === 0 ||
        values.owners.some((o) => !o.id || typeof o.percentage !== "number")
      ) {
        throw new Error(
          "Los propietarios deben tener un ID y porcentaje válido"
        );
      }

      // Validar suma de porcentajes
      const totalPercentage = values.owners.reduce(
        (acc, o) => acc + o.percentage,
        0
      );

      if (totalPercentage !== 100) {
        throw new Error(
          "La suma de los porcentajes de los propietarios debe ser 100."
        );
      }

      await db.execute("BEGIN TRANSACTION");

      try {
        // Actualizar datos del gasto
        await db.execute(
          `UPDATE expenses
           SET description = $1,
               amount = $2,
               payment_method = $3,
               created_at = $4
           WHERE id = $5`,
          [
            values.description,
            values.amount,
            values.payment_method,
            createdAt,
            values.id,
          ]
        );

        // Borrar relaciones antiguas de owners para este gasto
        await db.execute(`DELETE FROM expense_owners WHERE expense_id = $1`, [
          values.id,
        ]);

        // Insertar las nuevas relaciones owners
        for (const owner of values.owners) {
          // Validar que el owner exista (opcional, pero recomendable)
          const existingOwner = await db.select<{ id: number }[]>(
            `SELECT id FROM owners WHERE id = $1`,
            [owner.id]
          );

          if (existingOwner.length === 0) {
            throw new Error(`El propietario con ID ${owner.id} no existe`);
          }

          await db.execute(
            `INSERT INTO expense_owners (expense_id, owner_id, percentage)
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
