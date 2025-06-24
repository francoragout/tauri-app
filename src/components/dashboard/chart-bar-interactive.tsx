import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FinancialReport } from "@/lib/types";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

export const description = "An interactive area chart";

const chartConfig = {
  sales: {
    label: "Ventas",
    color: "var(--chart-2)",
  },
  purchases: {
    label: "Compras",
    color: "var(--chart-1)",
  },
  expenses: {
    label: "Gastos",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

function parseLocalDate(dateStr: string) {
  return parse(dateStr, "yyyy-MM", new Date());
}

export function ChartBarInteractive({
  monthlyReports,
}: {
  monthlyReports: FinancialReport[];
}) {
  const ismobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("12mo");

  React.useEffect(() => {
    if (ismobile) {
      setTimeRange("6mo");
    }
  }, [ismobile]);

  const filteredData = monthlyReports
    .filter((item) => {
      const date = parseLocalDate(item.local_date);
      const referenceDate = new Date();
      let monthsToSubtract =
        timeRange === "9mo" ? 9 : timeRange === "12mo" ? 12 : 6;
      const startDate = new Date(referenceDate);
      startDate.setMonth(startDate.getMonth() - monthsToSubtract + 1);
      return date >= startDate && date <= referenceDate;
    })
    .sort(
      (a, b) =>
        new Date(a.local_date).getTime() - new Date(b.local_date).getTime()
    );

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Reportes Mensuales</CardTitle>
        <CardAction>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              size="sm"
              aria-label="Select a value"
              className="w-[160px] rounded-lg sm:ml-auto"
            >
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="6mo" className="rounded-lg">
                Últimos 6 meses
              </SelectItem>
              <SelectItem value="9mo" className="rounded-lg">
                Últimos 9 meses
              </SelectItem>
              <SelectItem value="12mo" className="rounded-lg">
                Últimos 12 meses
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="local_date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = parseLocalDate(value);
                return format(date, "MMM yyyy", { locale: es });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[175px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("es-ES", {
                      month: "long",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey="sales" fill="var(--color-sales)" name="Ventas" />
            <Bar
              dataKey="purchases"
              fill="var(--color-purchases)"
              name="Compras"
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              name="Gastos"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
