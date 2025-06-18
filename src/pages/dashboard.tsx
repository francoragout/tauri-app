import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartAreaInteractive } from "@/components/dashboard/chart-line-interactive";
import { ChartBarInteractive } from "@/components/dashboard/chart-bar-interactive";
import { useQuery } from "@tanstack/react-query";
import { FinancialReport } from "@/lib/types";
import { getDb } from "@/lib/db";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { DashboardColumns } from "@/components/dashboard/dashboard-columns";

async function GetDailyFinancialReport(): Promise<FinancialReport[]> {
  const db = await getDb();
  return db.select<FinancialReport[]>(
    `
      WITH sales_by_day AS (
      SELECT date(datetime(paid_at, '-3 hours')) AS local_date, SUM(total) AS sales
      FROM sales
      WHERE paid_at IS NOT NULL
      GROUP BY local_date
      ),
      purchases_by_day AS (
        SELECT date(datetime(created_at, '-3 hours')) AS local_date, SUM(total) AS purchases
        FROM purchases
        GROUP BY local_date
      ),
      expenses_by_day AS (
        SELECT date(datetime(created_at, '-3 hours')) AS local_date, SUM(amount) AS expenses
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

async function GetMonthlyFinancialReport(): Promise<FinancialReport[]> {
  const db = await getDb();
  return db.select<FinancialReport[]>(
    `
      WITH sales_by_month AS (
      SELECT strftime('%Y-%m', datetime(paid_at, '-3 hours')) AS local_date, SUM(total) AS sales
      FROM sales
      WHERE paid_at IS NOT NULL
      GROUP BY local_date
      ),
      purchases_by_month AS (
        SELECT strftime('%Y-%m', datetime(created_at, '-3 hours')) AS local_date, SUM(total) AS purchases
        FROM purchases
        GROUP BY local_date
      ),
      expenses_by_month AS (
        SELECT strftime('%Y-%m', datetime(created_at, '-3 hours')) AS local_date, SUM(amount) AS expenses
        FROM expenses
        GROUP BY local_date
      )

      SELECT
        m.local_date,
        IFNULL(s.sales, 0) AS sales,
        IFNULL(p.purchases, 0) AS purchases,
        IFNULL(e.expenses, 0) AS expenses,
        IFNULL(s.sales, 0) - IFNULL(p.purchases, 0) - IFNULL(e.expenses, 0) AS net_profit
      FROM (
        SELECT local_date FROM sales_by_month
        UNION
        SELECT local_date FROM purchases_by_month
        UNION
        SELECT local_date FROM expenses_by_month
      ) m
      LEFT JOIN sales_by_month s ON m.local_date = s.local_date
      LEFT JOIN purchases_by_month p ON m.local_date = p.local_date
      LEFT JOIN expenses_by_month e ON m.local_date = e.local_date
      ORDER BY m.local_date DESC;
    `
  );
}

export default function Dashboard() {
  const { data: dailyReports = [], isLoading: isDailyLoading } = useQuery<
    FinancialReport[]
  >({
    queryKey: ["daily_financial_report"],
    queryFn: GetDailyFinancialReport,
  });

  const { data: monthlyReports = [], isLoading: isMonthlyLoading } = useQuery<
    FinancialReport[]
  >({
    queryKey: ["monthly_financial_report"],
    queryFn: GetMonthlyFinancialReport,
  });

  const isLoading = isDailyLoading || isMonthlyLoading;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <Tabs defaultValue="daily_report" className="space-y-2">
          <TabsList className="h-[32px] w-[250px]">
            <TabsTrigger value="daily_report" className="h-7">
              Diario
            </TabsTrigger>
            <TabsTrigger value="monthly_report" className="h-7">
              Mensual
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="daily_report"
            className="flex flex-col gap-4 md:gap-6"
          >
            <ChartAreaInteractive dailyReports={dailyReports} />
            <DashboardTable
              data={dailyReports}
              columns={DashboardColumns}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent
            value="monthly_report"
            className="flex flex-col gap-4 md:gap-6"
          >
            <ChartBarInteractive monthlyReports={monthlyReports} />
            <DashboardTable
              data={monthlyReports}
              columns={DashboardColumns}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
