import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function BillsTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-4">
        <Input
          placeholder="Filtrar clientes..."
          value={
            (table.getColumn("customer_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("customer_name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
    </div>
  );
}
