import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Customer } from "../zod";
import Database from "@tauri-apps/plugin-sql";

export function GetCustomers(): Promise<Customer[]> {
  return Database.load("sqlite:mydatabase.db").then((db) =>
    db.select(`SELECT * FROM customers`)
  );
}

export function CreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Customer) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO customers (name, reference, phone)
         VALUES ($1, $2, $3)`,
        [values.name, values.reference, values.phone]
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
        `UPDATE customers SET name = $1, reference = $2, phone = $3 WHERE id = $4`,
        [values.name, values.reference, values.phone, values.id]
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

      const result = await db.select<{ count: number }[]>(
        `SELECT COUNT(*) as count FROM sales WHERE customer_id IN (${ids.join(
          ","
        )}) AND is_paid = 0`
      );

      const totalCount = result.reduce((acc, row) => acc + row.count, 0);
      if (totalCount > 0) {
        throw new Error("No se puede eliminar un cliente con deudas");
      }

      await db.execute(`DELETE FROM customers WHERE id IN (${ids.join(",")})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
