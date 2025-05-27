import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { SectionCards } from "@/components/dashboard/section-cards";
import { GetExpenses } from "@/lib/mutations/useExpense";
import { GetPurchases } from "@/lib/mutations/usePurchase";
import { GetSales } from "@/lib/mutations/useSale";
import { Expense, Purchase, Sale } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["month_sales"],
    queryFn: GetSales,
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["month_expenses"],
    queryFn: GetExpenses,
  });

  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ["month_purchases"],
    queryFn: GetPurchases,
  });

  const currentYearMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const currentMonthSalesTotal = sales
    .filter((sale) => sale.local_date?.slice(0, 7) === currentYearMonth)
    .reduce((sum, sale) => sum + sale.total, 0);

  const currentMonthExpensesTotal = expenses
    .filter((expense) => expense.local_date?.slice(0, 7) === currentYearMonth)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const currentMonthPurchasesTotal = purchases
    .filter((purchase) => purchase.local_date?.slice(0, 7) === currentYearMonth)
    .reduce((sum, purchase) => sum + purchase.total, 0);

  const currentMonthEarningsTotal =
    currentMonthSalesTotal -
    currentMonthExpensesTotal -
    currentMonthPurchasesTotal;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6">
          <SectionCards
            currentMonthSalesTotal={currentMonthSalesTotal}
            currentMonthExpensesTotal={currentMonthExpensesTotal}
            currentMonthPurchasesTotal={currentMonthPurchasesTotal}
            currentMonthEarningsTotal={currentMonthEarningsTotal}
          />
          <ChartAreaInteractive />
        </div>
      </div>
    </div>
  );
}
