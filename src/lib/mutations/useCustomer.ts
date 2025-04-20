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
