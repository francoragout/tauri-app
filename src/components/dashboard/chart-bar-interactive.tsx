import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

const chartData = [
  { month: "2024-01", purchases: 6720, sales: 15780, expenses: 1880 },
  { month: "2024-02", purchases: 5980, sales: 13240, expenses: 1730 },
  { month: "2024-03", purchases: 7540, sales: 16150, expenses: 2120 },
  { month: "2024-04", purchases: 8010, sales: 14870, expenses: 2240 },
  { month: "2024-05", purchases: 8650, sales: 13890, expenses: 2010 },
  { month: "2024-06", purchases: 7230, sales: 14320, expenses: 1950 },
  { month: "2024-07", purchases: 9420, sales: 16600, expenses: 2550 },
  { month: "2024-08", purchases: 8890, sales: 15950, expenses: 2400 },
  { month: "2024-09", purchases: 7950, sales: 14670, expenses: 2230 },
  { month: "2024-10", purchases: 9330, sales: 15210, expenses: 2480 },
  { month: "2024-11", purchases: 8510, sales: 13990, expenses: 2160 },
  { month: "2024-12", purchases: 9740, sales: 16480, expenses: 2590 },
];

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

export function ChartBarInteractive() {
  const ismobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("12mo");

  React.useEffect(() => {
    if (ismobile) {
      setTimeRange("6mo");
    }
  }, [ismobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.month + "-01");
    const referenceDate = new Date("2024-12-01"); // Último mes de tus datos
    let monthsToSubtract = 6;
    if (timeRange === "9mo") {
      monthsToSubtract = 9;
    } else if (timeRange === "12mo") {
      monthsToSubtract = 12;
    }
    const startDate = new Date(referenceDate);
    startDate.setMonth(startDate.getMonth() - monthsToSubtract + 1);
    return date >= startDate && date <= referenceDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Reportes Mensuales</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total por los últimos 12 meses
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="12mo">Últimos 12 meses</ToggleGroupItem>
            <ToggleGroupItem value="9mo">Últimos 9 meses</ToggleGroupItem>
            <ToggleGroupItem value="6mo">Últimos 6 meses</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
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
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("es-ES", {
                  month: "short",
                  year: "2-digit",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
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
