import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
import Database from "@tauri-apps/plugin-sql";
import { useEffect, useState } from "react";

async function getSalesSummaryThisMonth(): Promise<
  { payment_group: string; total_sales: number }[]
> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
    SELECT 
      CASE
        WHEN payment_method = 'cash' THEN 'Cash'
        ELSE 'Other'
      END AS payment_group,
      SUM(total) AS total_sales
    FROM sales
    WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
    GROUP BY payment_group
    UNION ALL
    SELECT 
      'Total' AS payment_group,
      SUM(total) AS total_sales
    FROM sales
    WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now');
  `;
  const result = await db.select<
    { payment_group: string; total_sales: number }[]
  >(query);
  return result;
}

export function SectionCards() {
  const [salesSummary, setSalesSummary] = useState<
    { payment_group: string; total_sales: number }[]
  >([]);

  useEffect(() => {
    async function fetchSalesSummary() {
      const summary = await getSalesSummaryThisMonth();
      setSalesSummary(summary);
    }
    fetchSalesSummary();
  }, []);

  const totalGeneral =
    salesSummary.find((item) => item.payment_group === "Total")?.total_sales ||
    0;
  const groupedSales = salesSummary.filter(
    (item) => item.payment_group !== "Total"
  );

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Gan</CardDescription>
          <CardTitle className="">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Calendar />
              Este mes
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="">
          
        </CardFooter>
      </Card>
      {/* <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ganancias</CardDescription>
          <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight">
            ${totalGeneral}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Calendar />
              Este mes
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex justify-between">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <span className="text-muted-foreground">Efectivo:</span>$
            {groupedSales
              .filter((item) => item.payment_group === "Cash")
              .map((item) => item.total_sales)
              .reduce((a, b) => a + b, 0)}
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            <span className="text-muted-foreground">Débito:</span>$
            {groupedSales
              .filter((item) => item.payment_group === "Other")
              .map((item) => item.total_sales)
              .reduce((a, b) => a + b, 0)}
          </div>
          
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total</CardDescription>
          <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Calendar />
              Este mes
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card> */}
    </div>
  );
}
