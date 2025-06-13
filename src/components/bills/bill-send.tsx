import { Bill } from "@/lib/zod";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { IconBrandWhatsapp } from "@tabler/icons-react";

export default function BillSend({ bill }: { bill: Bill }) {
  return (
    <Button
      className="flex justify-start pl-2"
      variant="ghost"
      size="sm"
      aria-label="Enviar mensaje por WhatsApp"
      onClick={() => {
        if (!bill.customer_phone) {
          toast.error("El cliente no tiene número de teléfono");
          return;
        }

        const billSummary = bill.sales_summary
          .map(
            (sale) =>
              `${format(parse(sale.date, "yyyy-MM-dd", new Date()), "P", {
                locale: es,
              })} - $${sale.total.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
          )
          .join("\n");

        const totalFormatted = bill.total_debt.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        const totalWithSurcharge = (
          bill.total_debt *
          (1 + 5 / 100)
        ).toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        const yearMonth = format(
          parse(bill.year_month, "yyyy-MM", new Date()),
          "MMMM yyyy",
          { locale: es }
        );

        const message = `¡Hola! ¿Cómo estás?\nTe comparto el resumen de compras de *${bill.customer_name}* correspondiente a *${yearMonth}*:\n\n${billSummary}\n\nTotal: *$${totalFormatted}*\n\n*Formas de pago disponibles:*\n- Efectivo: *$${totalFormatted}* (sin recargo)\n- Transferencia o tarjeta: *$${totalWithSurcharge}* (5% de recargo)\n\nPor favor avisar el medio de pago una vez definido.\n\n*Datos para transferencia:*\nALIAS: \`biancascalora\`\n\nAnte cualquier duda o consulta, quedo a disposición.`;

        const url = `https://wa.me/+549${
          bill.customer_phone
        }?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
      }}
    >
      <IconBrandWhatsapp />
      Enviar cuenta
    </Button>
  );
}
