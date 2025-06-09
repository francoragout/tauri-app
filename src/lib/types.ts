export type DailyFinancialReport = {
  local_date: string;
  sales: number;
  purchases: number;
  expenses: number;
  net_profit: number;
};

export type MonthlyFinancialReport = {
  local_month: string;
  sales: number;
  purchases: number;
  expenses: number;
  net_profit: number;
};
