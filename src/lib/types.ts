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

export type Bill = {
  customer_id: number;
  customer_name: string;
  year_month: string;
  sales_summary: {
    date: string;
    sale_id: number;
    total: number;
  };
  total_debt: number;
};
