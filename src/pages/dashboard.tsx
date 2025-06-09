import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyFinancialReport, MonthlyFinancialReport } from "@/lib/types";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { SectionCards } from "@/components/dashboard/section-cards";
import { useQuery } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { DailyFinancialReportTable } from "@/components/dashboard/daily-financial-report-table";
import { DailyFinancialReportColumns } from "@/components/dashboard/daily-financial-report-columns";
import { MonthlyFinancialReportTable } from "@/components/dashboard/monthly-financial-report-table";
import { MonthlyFinancialReportColumns } from "@/components/dashboard/monthly-financial-report-columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function GetDailyFinancialReport(): Promise<DailyFinancialReport[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  return db.select<DailyFinancialReport[]>(
    `
      WITH sales_by_day AS (
      SELECT date(datetime(date, '-3 hours')) AS local_date, SUM(total) AS sales
      FROM sales
      GROUP BY local_date
      ),
      purchases_by_day AS (
        SELECT date(datetime(date, '-3 hours')) AS local_date, SUM(total) AS purchases
        FROM purchases
        GROUP BY local_date
      ),
      expenses_by_day AS (
        SELECT date(datetime(date, '-3 hours')) AS local_date, SUM(amount) AS expenses
        FROM expenses
        GROUP BY local_date
      )

      SELECT
        d.local_date,
        IFNULL(s.sales, 0) AS sales,
        IFNULL(p.purchases, 0) AS purchases,
        IFNULL(e.expenses, 0) AS expenses,
        IFNULL(s.sales, 0) - IFNULL(p.purchases, 0) - IFNULL(e.expenses, 0) AS net_profit
      FROM (
        SELECT local_date FROM sales_by_day
        UNION
        SELECT local_date FROM purchases_by_day
        UNION
        SELECT local_date FROM expenses_by_day
      ) d
      LEFT JOIN sales_by_day s ON d.local_date = s.local_date
      LEFT JOIN purchases_by_day p ON d.local_date = p.local_date
      LEFT JOIN expenses_by_day e ON d.local_date = e.local_date
      ORDER BY d.local_date DESC;
    `
  );
}

async function GetMonthlyFinancialReport(): Promise<MonthlyFinancialReport[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  return db.select<MonthlyFinancialReport[]>(
    `
      WITH sales_by_month AS (
      SELECT strftime('%Y-%m', datetime(date, '-3 hours')) AS local_month, SUM(total) AS sales
      FROM sales
      GROUP BY local_month
      ),
      purchases_by_month AS (
        SELECT strftime('%Y-%m', datetime(date, '-3 hours')) AS local_month, SUM(total) AS purchases
        FROM purchases
        GROUP BY local_month
      ),
      expenses_by_month AS (
        SELECT strftime('%Y-%m', datetime(date, '-3 hours')) AS local_month, SUM(amount) AS expenses
        FROM expenses
        GROUP BY local_month
      )

      SELECT
        m.local_month,
        IFNULL(s.sales, 0) AS sales,
        IFNULL(p.purchases, 0) AS purchases,
        IFNULL(e.expenses, 0) AS expenses,
        IFNULL(s.sales, 0) - IFNULL(p.purchases, 0) - IFNULL(e.expenses, 0) AS net_profit
      FROM (
        -- union de todos los meses involucrados
        SELECT local_month FROM sales_by_month
        UNION
        SELECT local_month FROM purchases_by_month
        UNION
        SELECT local_month FROM expenses_by_month
      ) m
      LEFT JOIN sales_by_month s ON m.local_month = s.local_month
      LEFT JOIN purchases_by_month p ON m.local_month = p.local_month
      LEFT JOIN expenses_by_month e ON m.local_month = e.local_month
      ORDER BY m.local_month DESC;
    `
  );
}

export default function Dashboard() {
  const { data: dailyReports = [] } = useQuery<DailyFinancialReport[]>({
    queryKey: ["daily_financial_report"],
    queryFn: GetDailyFinancialReport,
  });

  const { data: monthlyReports = [] } = useQuery<MonthlyFinancialReport[]>({
    queryKey: ["monthly_financial_report"],
    queryFn: GetMonthlyFinancialReport,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6">
          <SectionCards monthlyReports={monthlyReports} />
          <ChartAreaInteractive dailyReports={dailyReports} />
          <Card className="@container/card">
            <Tabs defaultValue="daily_report">
              <CardHeader className="flex justify-between items-center mb-4">
                <div className="space-y-2">
                  <CardTitle>Reportes</CardTitle>
                  <CardDescription>
                    <span className="hidden @[540px]/card:block">
                      Total for the last 3 months
                    </span>
                    <span className="@[540px]/card:hidden">Last 3 months</span>
                  </CardDescription>
                </div>
                <TabsList>
                  <TabsTrigger value="daily_report">Diarios</TabsTrigger>
                  <TabsTrigger value="monthly_report">Mensuales</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="daily_report">
                  <DailyFinancialReportTable
                    data={dailyReports}
                    columns={DailyFinancialReportColumns}
                  />
                </TabsContent>
                <TabsContent value="monthly_report">
                  <MonthlyFinancialReportTable
                    data={monthlyReports}
                    columns={MonthlyFinancialReportColumns}
                  />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
