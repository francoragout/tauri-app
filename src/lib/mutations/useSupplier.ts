import Database from "@tauri-apps/plugin-sql";
import { Supplier } from "../zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function GetSuppliers(): Promise<Supplier[]> {
  return Database.load("sqlite:mydatabase.db").then((db) =>
    db.select(`SELECT id, name FROM suppliers`)
  );
}

export function CreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Supplier) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // Normaliza el nombre: elimina espacios y convierte a minúsculas
      const cleanName = values.name.trim().toLowerCase();

      // Verifica si ya existe un proveedor con ese nombre normalizado
      const existing = await db.select<{ id: number }[]>(
        `SELECT id FROM suppliers WHERE LOWER(TRIM(name)) = $1`,
        [cleanName]
      );

      if (existing.length > 0) {
        throw new Error("Ya existe un proveedor con ese nombre");
      }

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
      const db = await Database.load("sqlite:mydatabase.db");

      const cleanName = values.name.trim().toLowerCase();

      // Busca proveedores con ese nombre que NO sean el actual
      const existing = await db.select<{ id: number }[]>(
        `SELECT id FROM suppliers WHERE LOWER(TRIM(name)) = $1 AND id != $2`,
        [cleanName, values.id]
      );

      if (existing.length > 0) {
        throw new Error("Ya existe un proveedor con ese nombre");
      }

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
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(`DELETE FROM suppliers WHERE id IN (${ids.join(",")})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
