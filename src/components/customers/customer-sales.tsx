import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { GetSalesByCutomerId } from "@/lib/mutations/useSale";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";

interface CustomerSalesProps {
  customerId: number;
  current_debt: number;
  onOpenChange?: (open: boolean) => void;
}

export default function CustomerSales({
  customerId,
  current_debt,
  onOpenChange = () => {},
}: CustomerSalesProps) {
  const getSalesByCustomer = GetSalesByCutomerId();
    const [surcharge, setSurcharge] = useState(0);
  

  useEffect(() => {
    if (customerId) {
      getSalesByCustomer.mutate(customerId);
    }
  }, [customerId]);

  return (
    <Table>
      <TableCaption>Ventas recientes</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Hora</TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {getSalesByCustomer.data?.map((sale) => {
          const date = new Date(sale.date + "Z");
          const time = new Date(sale.date + "Z");
          return (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">
                {format(date, "PP", { locale: es })}
              </TableCell>

              <TableCell className="font-medium">
                {format(time, "p", { locale: es })}
              </TableCell>
              <TableCell className="text-right">${sale.total}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>
            <Select
              value={surcharge.toString()}
              onValueChange={(value) => {
                const numericValue = Number(value);
                setSurcharge(numericValue);
              }}
            >
              <SelectTrigger size="sm" className="bg-background">
                <SelectValue>{surcharge}%</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"0"}>0%</SelectItem>
                <SelectItem value={"1"}>1%</SelectItem>
                <SelectItem value={"2"}>2%</SelectItem>
                <SelectItem value={"3"}>3%</SelectItem>
                <SelectItem value={"4"}>4%</SelectItem>
                <SelectItem value={"5"}>5%</SelectItem>
                <SelectItem value={"6"}>6%</SelectItem>
                <SelectItem value={"7"}>7%</SelectItem>
                <SelectItem value={"8"}>8%</SelectItem>
                <SelectItem value={"9"}>9%</SelectItem>
                <SelectItem value={"10"}>10%</SelectItem>
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell className="text-right">${current_debt}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
