import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Customer } from "../zod";
import Database from "@tauri-apps/plugin-sql";

export function CreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Customer) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO customers (full_name, reference, phone)
         VALUES ($1, $2, $3)`,
        [values.full_name, values.reference, values.phone]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function UpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Customer) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `UPDATE customers SET full_name = $1, reference = $2, phone = $3 WHERE id = $4`,
        [values.full_name, values.reference, values.phone, values.id]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function DeleteCustomers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(`DELETE FROM customers WHERE id IN (${ids.join(",")})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
