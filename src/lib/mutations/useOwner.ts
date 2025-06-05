import Database from "@tauri-apps/plugin-sql";
import { Owner } from "../zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function GetOwners(): Promise<Owner[]> {
  return Database.load("sqlite:mydatabase.db").then((db) =>
    db.select(`SELECT * FROM owners`)
  );
}

export function CreateOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Owner) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO owners (name)
             VALUES ($1)`,
        [values.name]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });
}

export function UpdateOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Owner) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(`UPDATE owners SET name = $1 WHERE id = $2`, [
        values.name,
        values.id,
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });
}

export function DeleteOwners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(`DELETE FROM owners WHERE id IN (${ids.join(",")})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });
}
