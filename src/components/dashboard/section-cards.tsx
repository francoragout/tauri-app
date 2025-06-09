import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign } from "lucide-react";
import { MonthlyFinancialReport } from "@/lib/types";

type SectionCardsProps = {
  monthlyReports: MonthlyFinancialReport[];
};

export function SectionCards({ monthlyReports }: SectionCardsProps) {
  // 1. Obtener el mes actual en formato YYYY-MM
  const currentMonth = new Date().toISOString().slice(0, 7);

  // 2. Buscar el reporte del mes actual usando local_month
  const currentMonthReport = monthlyReports.find(
    (r) => r.local_month.slice(0, 7) === currentMonth
  );

  // 3. Definir los valores, usando 0 si no hay datos
  const sales = currentMonthReport?.sales ?? 0;
  const purchases = currentMonthReport?.purchases ?? 0;
  const expenses = currentMonthReport?.expenses ?? 0;
  const earnings = currentMonthReport?.net_profit ?? 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            <span>Ventas</span>
            <Badge variant="outline">
              <Calendar />
              Este mes
            </Badge>
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center ">
            <DollarSign />
            <span>
              {(() => {
                const [entero, decimales] = new Intl.NumberFormat("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
                  .format(sales)
                  .split(",");
                return (
                  <>
                    {entero}
                    <span className="text-[15px] align-super ms-1">
                      {decimales}
                    </span>
                  </>
                );
              })()}
            </span>
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            <span>Compras</span>
            <Badge variant="outline">
              <Calendar />
              Este mes
            </Badge>
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center ">
            <DollarSign />
            <span>
              {(() => {
                const [entero, decimales] = new Intl.NumberFormat("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
                  .format(purchases)
                  .split(",");
                return (
                  <>
                    {entero}
                    <span className="text-[15px] align-super ms-1">
                      {decimales}
                    </span>
                  </>
                );
              })()}
            </span>
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            <span>Gastos</span>
            <Badge variant="outline">
              <Calendar />
              Este mes
            </Badge>
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center ">
            <DollarSign />
            <span>
              {(() => {
                const [entero, decimales] = new Intl.NumberFormat("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
                  .format(expenses)
                  .split(",");
                return (
                  <>
                    {entero}
                    <span className="text-[15px] align-super ms-1">
                      {decimales}
                    </span>
                  </>
                );
              })()}
            </span>
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            <span>Total</span>
            <Badge variant="outline">
              <Calendar />
              Este mes
            </Badge>
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center ">
            <DollarSign />
            <span>
              {(() => {
                const [entero, decimales] = new Intl.NumberFormat("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
                  .format(earnings)
                  .split(",");
                return (
                  <>
                    {entero}
                    <span className="text-[15px] align-super ms-1">
                      {decimales}
                    </span>
                  </>
                );
              })()}
            </span>
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
