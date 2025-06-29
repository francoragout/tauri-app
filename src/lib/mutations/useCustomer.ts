import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Customer } from "../zod";
import { getDb } from "../db";

export async function GetCustomers(): Promise<Customer[]> {
  const db = await getDb();
  return db.select(`SELECT * FROM customers`);
}

export function CreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Customer) => {
      const db = await getDb();

      // 1. Normalizamos el nombre del cliente para evitar duplicados
      const cleanName = values.name.trim().toLowerCase();

      // 2. Verificamos si ya existe un cliente con ese nombre normalizado
      const existing = await db.select<{ id: number }[]>(
        `SELECT id FROM customers WHERE LOWER(TRIM(name)) = $1`,
        [cleanName]
      );

      // 3. Si existe, lanzamos un error
      if (existing.length > 0) {
        throw new Error("Ya existe un cliente con ese nombre");
      }

      // 4. Si no existe, insertamos el nuevo cliente
      await db.execute(
        `INSERT INTO customers (name, phone)
         VALUES ($1, $2)`,
        [values.name, values.phone]
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
      const db = await getDb();
      // 1. Normalizamos el nombre del cliente para evitar duplicados
      const cleanName = values.name.trim().toLowerCase();

      // 2. Verificamos si ya existe un cliente con ese nombre normalizado, excluyendo el actual
      const existing = await db.select<{ id: number }[]>(
        `SELECT id FROM customers WHERE LOWER(TRIM(name)) = $1 AND id != $2`,
        [cleanName, values.id]
      );

      // 3. Si existe, lanzamos un error
      if (existing.length > 0) {
        throw new Error("Ya existe un cliente con ese nombre");
      }

      // 4. Si no existe, actualizamos el cliente
      await db.execute(
        `UPDATE customers SET name = $1, phone = $2 WHERE id = $3`,
        [values.name, values.phone, values.id]
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
      const db = await getDb();

      // 1. Generamos placeholders para los IDs (ej: $1, $2, ...)
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");

      // 2. Verificamos si los clientes seleccionados tienen deudas (ventas no pagadas)
      const result = await db.select<{ count: number }[]>(
        `SELECT COUNT(*) as count FROM sales WHERE customer_id IN (${placeholders}) AND paid_at IS NULL`,
        ids
      );

      // 3. Obtenemos el conteo de ventas impagas
      const totalCount = result.length > 0 ? result[0].count : 0;

      // 4. Si existe al menos una venta impaga, cancelamos la operación
      if (totalCount > 0) {
        throw new Error("No se puede eliminar un cliente con deudas");
      }

      // 5. Eliminamos los clientes seleccionados de la base de datos
      await db.execute(
        `DELETE FROM customers WHERE id IN (${placeholders})`,
        ids
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
