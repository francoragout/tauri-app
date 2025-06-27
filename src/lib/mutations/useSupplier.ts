import { Supplier } from "../zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDb } from "../db";

export async function GetSuppliers(): Promise<Supplier[]> {
  const db = await getDb();
  return db.select(`SELECT id, name FROM suppliers;`);
}

export function CreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Supplier) => {
      const db = await getDb();

      // Validación duplicados: asegurar que no exista un proveedor con el mismo nombre
      const cleanName = values.name.trim().toLowerCase();

      const existing = await db.select<{ id: number }[]>(
        `SELECT id FROM suppliers WHERE LOWER(TRIM(name)) = $1`,
        [cleanName]
      );

      if (existing.length > 0) {
        throw new Error("Ya existe un proveedor con ese nombre");
      }

      // Crear proveedor
      await db.execute(
        `INSERT INTO suppliers (name, phone, address) VALUES ($1, $2, $3)`,
        [values.name, values.phone, values.address]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function UpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Supplier) => {
      const db = await getDb();

      // Validación duplicados: asegurar que no exista un proveedor con el mismo nombre que no sea el mismo que se está actualizando
      const cleanName = values.name.trim().toLowerCase();

      const existing = await db.select<{ id: number }[]>(
        `SELECT id FROM suppliers WHERE LOWER(TRIM(name)) = $1 AND id != $2`,
        [cleanName, values.id]
      );

      if (existing.length > 0) {
        throw new Error("Ya existe un proveedor con ese nombre");
      }

      // Actualizar proveedor
      await db.execute(
        `UPDATE suppliers SET name = $1, phone = $2, address = $3 WHERE id = $4`,
        [values.name, values.phone, values.address, values.id]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function DeleteSuppliers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await getDb();

      const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
      await db.execute(
        `DELETE FROM suppliers WHERE id IN (${placeholders})`,
        ids
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
