import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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

import { parse, format } from "date-fns";
import { es } from "date-fns/locale";
import { FinancialReport } from "@/lib/types";

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
  return parse(dateStr, "yyyy-MM-dd", new Date());
}

export function ChartAreaInteractive({
  dailyReports,
}: {
  dailyReports: FinancialReport[];
}) {
  const ismobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (ismobile) {
      setTimeRange("7d");
    }
  }, [ismobile]);

  const filteredData = dailyReports
    .filter((item) => {
      const date = parseLocalDate(item.local_date);
      const referenceDate = new Date();
      let daysToSubtract = 90;
      if (timeRange === "30d") {
        daysToSubtract = 30;
      } else if (timeRange === "7d") {
        daysToSubtract = 7;
      }
      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      return date >= startDate;
    })
    .sort(
      (a, b) =>
        parseLocalDate(a.local_date).getTime() -
        parseLocalDate(b.local_date).getTime()
    );

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Reportes Diarios</CardTitle>
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
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 días
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 días
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
          <LineChart
            accessibilityLayer
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
                return format(date, "MMM d", { locale: es });
              }}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[175px]"
                  labelFormatter={(value) => {
                    return format(parseLocalDate(value), "PPP", {
                      locale: es,
                    });
                  }}
                />
              }
            />
            <Line
              dataKey="sales"
              type="monotone"
              stroke="var(--color-sales)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="purchases"
              type="monotone"
              stroke="var(--color-purchases)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="expenses"
              type="monotone"
              stroke="var(--color-expenses)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
