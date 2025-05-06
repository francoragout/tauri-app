"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Product } from "@/lib/zod";
import PurchaseCreateForm from "./purchase-create-form";
import { DeletePurchases } from "@/lib/mutations/usePurchase";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  products: Product[];
}

export function PurchasesTableToolbar<TData>({
  table,
  products,
}: DataTableToolbarProps<TData>) {
  const selectedRowsCount = table.getSelectedRowModel().rows.length;
  const [date, setDate] = useState<Date>();
  const { mutate } = DeletePurchases();

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const purchasesIds = selectedRows.map(
      (row) => (row.original as { id: number }).id
    );

    mutate(purchasesIds, {
      onSuccess: () => {
        table.resetRowSelection();
        toast.success(
          `Se han eliminado ${purchasesIds.length} compras seleccionadas`
        );
      },
      onError: () => {
        toast.error("Error al eliminar gastos seleccionados");
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
                <span>Filtrar compras...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              locale={es}
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                if (
                  selectedDate?.toISOString().split("T")[0] !==
                  date?.toISOString().split("T")[0]
                ) {
                  setDate(selectedDate);
                  table
                    .getColumn("date")
                    ?.setFilterValue(selectedDate?.toISOString().split("T")[0]);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex space-x-2">
        {selectedRowsCount > 1 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Trash className="h-4 w-4" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Estas completamente seguro?
                </AlertDialogTitle>
                <AlertDialogDescription className="flex flex-col space-y-3">
                  <span>
                    Esta acción no se puede deshacer. Esto eliminará
                    permanentemente las compras seleccionadas de la base de
                    datos.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSelected}>
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <PurchaseCreateForm products={products} />
      </div>
    </div>
  );
}
