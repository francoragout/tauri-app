import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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
  { date: "2024-04-01", purchases: 310, sales: 480, expenses: 75 },
  { date: "2024-04-02", purchases: 230, sales: 390, expenses: 40 },
  { date: "2024-04-03", purchases: 275, sales: 420, expenses: 90 },
  { date: "2024-04-04", purchases: 245, sales: 410, expenses: 70 },
  { date: "2024-04-05", purchases: 325, sales: 520, expenses: 100 },
  { date: "2024-04-06", purchases: 290, sales: 470, expenses: 85 },
  { date: "2024-04-07", purchases: 210, sales: 400, expenses: 50 },
  { date: "2024-04-08", purchases: 300, sales: 510, expenses: 110 },
  { date: "2024-04-09", purchases: 220, sales: 380, expenses: 30 },
  { date: "2024-04-10", purchases: 265, sales: 450, expenses: 65 },
  { date: "2024-04-11", purchases: 335, sales: 540, expenses: 95 },
  { date: "2024-04-12", purchases: 310, sales: 490, expenses: 90 },
  { date: "2024-04-13", purchases: 340, sales: 530, expenses: 100 },
  { date: "2024-04-14", purchases: 205, sales: 370, expenses: 55 },
  { date: "2024-04-15", purchases: 215, sales: 400, expenses: 60 },
  { date: "2024-04-16", purchases: 225, sales: 420, expenses: 75 },
  { date: "2024-04-17", purchases: 330, sales: 510, expenses: 105 },
  { date: "2024-04-18", purchases: 310, sales: 500, expenses: 90 },
  { date: "2024-04-19", purchases: 295, sales: 480, expenses: 85 },
  { date: "2024-04-20", purchases: 240, sales: 460, expenses: 70 },
  { date: "2024-04-21", purchases: 280, sales: 490, expenses: 80 },
  { date: "2024-04-22", purchases: 260, sales: 450, expenses: 60 },
  { date: "2024-04-23", purchases: 275, sales: 470, expenses: 75 },
  { date: "2024-04-24", purchases: 300, sales: 520, expenses: 95 },
  { date: "2024-04-25", purchases: 235, sales: 440, expenses: 55 },
  { date: "2024-04-26", purchases: 200, sales: 400, expenses: 30 },
  { date: "2024-04-27", purchases: 310, sales: 530, expenses: 85 },
  { date: "2024-04-28", purchases: 245, sales: 460, expenses: 60 },
  { date: "2024-04-29", purchases: 320, sales: 510, expenses: 100 },
  { date: "2024-04-30", purchases: 330, sales: 540, expenses: 110 },
  { date: "2024-05-01", purchases: 225, sales: 420, expenses: 70 },
  { date: "2024-05-02", purchases: 295, sales: 500, expenses: 95 },
  { date: "2024-05-03", purchases: 265, sales: 460, expenses: 80 },
  { date: "2024-05-04", purchases: 315, sales: 530, expenses: 90 },
  { date: "2024-05-05", purchases: 340, sales: 550, expenses: 115 },
  { date: "2024-05-06", purchases: 350, sales: 545, expenses: 100 },
  { date: "2024-05-07", purchases: 300, sales: 480, expenses: 85 },
  { date: "2024-05-08", purchases: 215, sales: 390, expenses: 40 },
  { date: "2024-05-09", purchases: 245, sales: 420, expenses: 60 },
  { date: "2024-05-10", purchases: 295, sales: 500, expenses: 100 },
  { date: "2024-05-11", purchases: 310, sales: 490, expenses: 90 },
  { date: "2024-05-12", purchases: 235, sales: 440, expenses: 75 },
  { date: "2024-05-13", purchases: 220, sales: 430, expenses: 70 },
  { date: "2024-05-14", purchases: 335, sales: 540, expenses: 110 },
  { date: "2024-05-15", purchases: 340, sales: 535, expenses: 105 },
  { date: "2024-05-16", purchases: 300, sales: 510, expenses: 90 },
  { date: "2024-05-17", purchases: 330, sales: 520, expenses: 95 },
  { date: "2024-05-18", purchases: 270, sales: 470, expenses: 80 },
  { date: "2024-05-19", purchases: 250, sales: 450, expenses: 65 },
  { date: "2024-05-20", purchases: 235, sales: 430, expenses: 55 },
  { date: "2024-05-21", purchases: 210, sales: 410, expenses: 35 },
  { date: "2024-05-22", purchases: 200, sales: 400, expenses: 30 },
  { date: "2024-05-23", purchases: 280, sales: 490, expenses: 85 },
  { date: "2024-05-24", purchases: 310, sales: 510, expenses: 95 },
  { date: "2024-05-25", purchases: 245, sales: 470, expenses: 70 },
  { date: "2024-05-26", purchases: 230, sales: 430, expenses: 65 },
  { date: "2024-05-27", purchases: 320, sales: 540, expenses: 105 },
  { date: "2024-05-28", purchases: 275, sales: 480, expenses: 85 },
  { date: "2024-05-29", purchases: 210, sales: 410, expenses: 40 },
  { date: "2024-05-30", purchases: 295, sales: 490, expenses: 75 },
  { date: "2024-05-31", purchases: 230, sales: 420, expenses: 50 },
  { date: "2024-06-01", purchases: 235, sales: 430, expenses: 60 },
  { date: "2024-06-02", purchases: 310, sales: 500, expenses: 95 },
  { date: "2024-06-03", purchases: 225, sales: 410, expenses: 50 },
  { date: "2024-06-04", purchases: 325, sales: 520, expenses: 90 },
  { date: "2024-06-05", purchases: 215, sales: 400, expenses: 45 },
  { date: "2024-06-06", purchases: 310, sales: 490, expenses: 85 },
  { date: "2024-06-07", purchases: 320, sales: 510, expenses: 90 },
  { date: "2024-06-08", purchases: 305, sales: 500, expenses: 85 },
  { date: "2024-06-09", purchases: 330, sales: 530, expenses: 100 },
  { date: "2024-06-10", purchases: 250, sales: 450, expenses: 65 },
  { date: "2024-06-11", purchases: 220, sales: 410, expenses: 50 },
  { date: "2024-06-12", purchases: 340, sales: 540, expenses: 110 },
  { date: "2024-06-13", purchases: 200, sales: 390, expenses: 35 },
  { date: "2024-06-14", purchases: 325, sales: 520, expenses: 95 },
  { date: "2024-06-15", purchases: 295, sales: 500, expenses: 85 },
  { date: "2024-06-16", purchases: 305, sales: 510, expenses: 90 },
  { date: "2024-06-17", purchases: 345, sales: 545, expenses: 110 },
  { date: "2024-06-18", purchases: 220, sales: 430, expenses: 50 },
  { date: "2024-06-19", purchases: 310, sales: 500, expenses: 95 },
  { date: "2024-06-20", purchases: 320, sales: 510, expenses: 100 },
  { date: "2024-06-21", purchases: 235, sales: 440, expenses: 60 },
  { date: "2024-06-22", purchases: 275, sales: 480, expenses: 75 },
  { date: "2024-06-23", purchases: 345, sales: 540, expenses: 110 },
  { date: "2024-06-24", purchases: 215, sales: 400, expenses: 45 },
  { date: "2024-06-25", purchases: 220, sales: 420, expenses: 55 },
  { date: "2024-06-26", purchases: 330, sales: 530, expenses: 100 },
  { date: "2024-06-27", purchases: 340, sales: 540, expenses: 105 },
  { date: "2024-06-28", purchases: 230, sales: 430, expenses: 60 },
  { date: "2024-06-29", purchases: 210, sales: 410, expenses: 40 },
  { date: "2024-06-30", purchases: 335, sales: 535, expenses: 105 },
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

export function ChartAreaInteractive() {
  const ismobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (ismobile) {
      setTimeRange("7d");
    }
  }, [ismobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Reportes Diarios</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total por los últimos 3 meses
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
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 días</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 días</ToggleGroupItem>
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
          <AreaChart data={filteredData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={ismobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("es-ES", {
                      month: "long",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="sales"             
              type="monotone"
              fill="none"
              stroke="var(--color-sales)"
              strokeWidth={2}
            />
            <Area
              dataKey="purchases"
              type="monotone"
              fill="none"
              stroke="var(--color-purchases)"
              strokeWidth={2}
            />
            <Area
              dataKey="expenses"
              type="monotone"
              fill="none"
              stroke="var(--color-expenses)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
