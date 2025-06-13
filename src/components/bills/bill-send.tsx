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
              `${format(new Date(sale.date), "P", {
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

        const message = `¡Buenas! ¿Cómo estás?\nTe comparto el resumen de compras correspondiente al perdiodo ${yearMonth} de ${bill.customer_name}\n\n${billSummary}\n\nComo siempre, están disponibles todos los medios de pago:\n- Efectivo (5% de descuento)\n- Transferencia o tarjeta (5% de recargo)\n\nPodés elegir el medio que te resulte más cómodo. Te pido, por favor, que me avises una vez que lo tengan definido.\nCualquier duda o consulta, quedo a disposición.\n\nDatos para transferencia:\nALIAS: biancascalora.bru\n\n- Monto con transferencia o tarjeta: $${totalWithSurcharge}\n- Monto con efectivo (con descuento): $${totalFormatted}`;

        console.log(message);

        // const url = `https://wa.me/+549${
        //   bill.customer_phone
        // }?text=${encodeURIComponent(message)}`;
        // window.open(url, "_blank");
      }}
    >
      <IconBrandWhatsapp />
      Enviar cuenta
    </Button>
  );
}
