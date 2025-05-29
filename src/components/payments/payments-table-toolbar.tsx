import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import PaymentForm from "./payment-form";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../ui/calendar";
import { DeletePayments } from "@/lib/mutations/usePayment";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function PaymentsTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const selectedRowsCount = table.getSelectedRowModel().rows.length;
  const { mutate, isPending } = DeletePayments();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [date, setDate] = useState<Date>();

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const customersIds = selectedRows.map(
      (row) => (row.original as { id: number }).id
    );

    mutate(customersIds, {
      onSuccess: () => {
        table.resetRowSelection();
        toast.success(
          `Se ${
            selectedRowsCount > 1
              ? `han eliminado ${selectedRowsCount} pagos seleccionados`
              : "ha eliminado el pago seleccionado"
          }`
        );
      },
      onError: () => {
        toast.error("Error al eliminar");
      },
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              size="sm"
              className={cn(
                "w-[150px] lg:w-[250px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, "PP", { locale: es })
              ) : (
                <span>Filtrar pagos...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              locale={es}
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                if (selectedDate) {
                  table.setColumnFilters([
                    {
                      id: "local_date",
                      value: format(selectedDate, "yyyy-MM-dd"),
                    },
                  ]);
                } else {
                  table.setColumnFilters([]);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex space-x-4">
        {selectedRowsCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={selectedRowsCount === 0}
              >
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Estas completamente seguro?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <span>
                    Esta acción no se puede deshacer. Esto eliminará
                    permanentemente{" "}
                    {selectedRowsCount > 1
                      ? `los ${selectedRowsCount} pagos seleccionados`
                      : "el pago seleccionado"}
                    .
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSelected}
                  disabled={isPending}
                >
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar pago</DialogTitle>
              <DialogDescription>
                Use tabs para navegar mas rapido entre los diferentes campos.
              </DialogDescription>
            </DialogHeader>
            <PaymentForm onOpenChange={setIsCreateOpen} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
