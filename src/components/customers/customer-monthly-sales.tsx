import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetMonthlySalesByCustomerId } from "@/lib/mutations/useSale";
import { useQuery } from "@tanstack/react-query";

import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";

type CustomerMonthlySalesProps = {
  customerId: number;
  onSalesOpenChange: (open: boolean) => void;
};

export default function CustomersMonthlySales({
  customerId,
  onSalesOpenChange,
}: CustomerMonthlySalesProps) {
  const { data = [] } = useQuery({
    queryKey: ["monthly-sales", customerId],
    queryFn: () => GetMonthlySalesByCustomerId(customerId),
  });
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Periodo</TableHead>
          <TableHead>Ventas</TableHead>
          <TableHead>Deuda</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              No hay ventas pendientes.
            </TableCell>
          </TableRow>
        ) : (
          data.map((row: any) => (
            <TableRow key={row.period}>
              <TableCell>
                {(() => {
                  const parsedPeriod = parse(row.period, "yyyy-MM", new Date());
                  if (!isValid(parsedPeriod)) return row.period;
                  return format(parsedPeriod, "LLLL yyyy", {
                    locale: es,
                  }).replace(/^./, (c) => c.toUpperCase());
                })()}
              </TableCell>
              <TableCell>
                {!row.sales_summary || row.sales_summary.length === 0 ? (
                  <div>-</div>
                ) : (
                  <div className="space-y-1">
                    {row.sales_summary.map((sale: any) => {
                      const parsedDate = parse(
                        sale.date,
                        "yyyy-MM-dd HH:mm:ss",
                        new Date()
                      );
                      if (!isValid(parsedDate))
                        return <div key={sale.id}>Fecha inválida</div>;

                      const formattedDate = format(parsedDate, "P", {
                        locale: es,
                      });
                      const formattedTotal = sale.total.toLocaleString(
                        "es-AR",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      );

                      return (
                        <div key={sale.id}>
                          {formattedDate} - $ {formattedTotal}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TableCell>
              <TableCell>
                $
                {row.debt.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Acciones</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Enviar resumen</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        onSalesOpenChange(false);
                      }}
                    >
                      Pagar deuda
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
