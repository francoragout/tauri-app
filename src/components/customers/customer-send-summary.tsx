import { Customer } from "@/lib/zod";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { IconBrandWhatsapp } from "@tabler/icons-react";

export default function CustomerSendSummary({
  customer,
}: {
  customer: Customer;
}) {
  return (
    <Button
      className="flex justify-start pl-2"
      variant="ghost"
      size="sm"
      aria-label="Enviar mensaje por WhatsApp"
      onClick={() => {
        if (!customer.phone) {
          toast.error("El cliente no tiene número de teléfono");
          return;
        } else if (customer.debt === 0) {
          toast.error("El cliente no tiene resumen de compras");
          return;
        }

        let phone = customer.phone ?? "";
        phone = `549${phone}`;

        const saleSummary = customer.sales_summary as string | null;

        let formattedSales = "";

        if (saleSummary) {
          formattedSales = saleSummary
            .split(", ")
            .map((sale) => {
              const lastSpaceIndex = sale.lastIndexOf(" ");
              const rawDateTime = sale.slice(0, lastSpaceIndex);
              const rawAmount = sale.slice(lastSpaceIndex + 1);

              const utcDate = new Date(rawDateTime.replace(" ", "T") + "Z");
              console.log("utcDate", utcDate);
              const localDate = format(utcDate, "d/M/yyyy", {
                locale: es,
              });

              const amount = Number(rawAmount);
              const formattedAmount = isNaN(amount)
                ? "Monto inválido"
                : amount.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });

              return `${localDate} - ${formattedAmount}`;
            })
            .join("\n");
        }

        const totalFormatted = Number(customer.debt).toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        const message = `Hola! ¿Cómo estás?\nTe dejo el resumen de compras de ${customer.full_name}\n\n${formattedSales}\n\nTotal: $${totalFormatted}`;

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(
          message
        )}`;
        window.open(url, "_blank");
      }}
    >
      <IconBrandWhatsapp />
      Enviar resumen
    </Button>
  );
}
