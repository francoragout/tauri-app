import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Payment } from "../zod";
import Database from "@tauri-apps/plugin-sql";

export function CreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Payment) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO payments (customer_id, payment_method, amount)
           VALUES ($1, $2, $3)`,
        [values.customer_id, values.payment_method, values.amount]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function UpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Payment) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `UPDATE payments
           SET customer_id = $1, payment_method = $2, amount = $3
           WHERE id = $4`,
        [values.customer_id, values.payment_method, values.amount, values.id]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function DeletePayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(`DELETE FROM payments WHERE id IN (${ids.join(",")})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
