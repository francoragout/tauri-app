import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { BanknoteArrowUp, SquarePen } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CustomerSchema } from "@/lib/zod";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import CustomerForm from "./customer-form";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import CustomerPaymentForm from "./customer-pay-form";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function CustomersTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const customer = CustomerSchema.parse(row.original);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              setIsUpdateOpen(true);
            }}
          >
            <SquarePen />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar expensa</DialogTitle>
            <DialogDescription>
              Use tabs para navegar mas rapido entre los diferentes campos.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm customer={customer} onOpenChange={setIsUpdateOpen} />
        </DialogContent>
      </Dialog>

      <Button
        className="flex justify-start pl-2"
        variant="ghost"
        size="sm"
        aria-label="Enviar mensaje por WhatsApp"
        onClick={() => {
          let phone = customer.phone?.replace(/\D/g, "") ?? "";
          phone = phone.replace(/^0+/, "");
          phone = `549${phone}`;

          if (phone.length < 13) {
            toast.error("El número de teléfono parece incompleto.");
            return;
          }

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
      </Button>

      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              setIsPayOpen(true);
            }}
          >
            <BanknoteArrowUp />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagar Deuda</DialogTitle>
            <DialogDescription>
              Use tabs para navegar mas rapido entre los diferentes campos.
            </DialogDescription>
          </DialogHeader>
          <CustomerPaymentForm
            customer={customer}
            onOpenChange={setIsPayOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
