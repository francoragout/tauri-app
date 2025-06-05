import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Payment } from "../zod";
import Database from "@tauri-apps/plugin-sql";

export function CreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Payment) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO payments (customer_id, method, amount, surcharge, period)
     VALUES ($1, $2, $3, $4, $5)`,
        [
          values.customer_id,
          values.method,
          values.amount,
          values.surcharge,
          values.period,
        ]
      );

      await db.execute(
        `UPDATE sales
           SET is_paid = 1
         WHERE customer_id = $1 AND strftime('%Y-%m', date) = $2`,
        [values.customer_id, values.period]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
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
           SET customer_id = $1, payment_method = $2, amount = $3, surcharge = $4
         WHERE id = $5`,
        [
          values.customer_id,
          values.method,
          values.amount,
          values.surcharge,
          values.id,
        ]
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
