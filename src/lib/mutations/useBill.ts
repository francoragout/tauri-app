import { useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { Bill } from "../zod";

export function PayBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Bill) => {
      const db = await Database.load("sqlite:mydatabase.db");

      const surcharge = values.surcharge as number;
      const payment_method = values.payment_method as string;

      const formattedDate = new Date()
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);

      // Actualizar cada venta por su ID
      for (const sale of values.sales_summary) {
        const saleId = sale.sale_id;
        const total = sale.total;
        const total_with_surcharge = total * (1 + surcharge / 100);

        // Actualizar la venta como pagada
        await db.execute(
          `UPDATE sales
           SET is_paid = 1, surcharge = $1, paid_at = $2, payment_method = $3, total = $4
           WHERE id = $5`,
          [
            surcharge,
            formattedDate,
            payment_method,
            total_with_surcharge,
            saleId,
          ]
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["today_sales"] });
    },
  });
}
