import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bill } from "../zod";
import { getDb } from "../db";

/**
 * Hook para marcar facturas como pagadas, actualizando cada venta correspondiente.
 * Aplica recargo, método de pago y fecha de pago actual.
 */
export function PayBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Bill) => {
      const db = await getDb();

      const surcharge = values.surcharge ?? 0; // % recargo, por defecto 0
      const payment_method = values.payment_method ?? "unknown";

      // Fecha actual formateada para SQL (YYYY-MM-DD HH:mm:ss)
      const formattedDate = new Date()
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);

      // Actualizar todas las ventas en paralelo para mejorar rendimiento
      await Promise.all(
        values.sales_summary.map(async (sale) => {
          const total_with_surcharge = sale.total * (1 + surcharge / 100);

          await db.execute(
            `UPDATE sales
             SET is_paid = 1, surcharge = $1, paid_at = $2, payment_method = $3, total = $4
             WHERE id = $5`,
            [
              surcharge,
              formattedDate,
              payment_method,
              total_with_surcharge,
              sale.sale_id,
            ]
          );
        })
      );
    },
    onSuccess: () => {
      // Refrescar caché relacionada con facturas y balances
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
