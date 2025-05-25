import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign } from "lucide-react";

type SectionCardsProps = {
  currentMonthSalesTotal: number;
  currentMonthExpensesTotal: number;
  currentMonthPurchasesTotal: number;
  currentMonthEarningsTotal: number;
};

export function SectionCards({
  currentMonthSalesTotal,
  currentMonthExpensesTotal,
  currentMonthPurchasesTotal,
  currentMonthEarningsTotal,
}: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            <span>Ganancias</span>
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
                  .format(currentMonthSalesTotal)
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
                  .format(currentMonthPurchasesTotal)
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
            <span>Expensas</span>
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
                  .format(currentMonthExpensesTotal)
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
                  .format(currentMonthEarningsTotal)
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
