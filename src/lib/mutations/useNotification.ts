import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDb } from "../db";
import { Notification } from "../zod";

export async function GetNotifications(): Promise<Notification[]> {
  const db = await getDb();
  return db.select(
    `SELECT id, datetime(created_at, '-3 hours') as local_date, title, message, link, is_read FROM notifications ORDER BY local_date DESC;`
  );
}


/**
 * Crea una notificación en la base de datos.
 */
export async function createNotification(
  title: string,
  message: string,
  link: string,
  db: Awaited<ReturnType<typeof getDb>>
) {
  await db.execute(
    `INSERT INTO notifications (title, message, link) VALUES ($1, $2, $3)`,
    [title, message, link]
  );
}

// Renombra la función para seguir la convención de hooks
export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const db = await getDb();
      await db.execute(
        `UPDATE notifications SET is_read = 1, read_at = datetime('now') WHERE is_read = 0;`
      );
      await db.execute(
        `DELETE FROM notifications WHERE is_read = 1 AND read_at < datetime('now', '-30 days');`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
