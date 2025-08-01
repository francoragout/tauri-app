export type FinancialReport = {
  local_date: string;
  sales: number;
  purchases: number;
  expenses: number;
  net_profit: number;
};

export type Bill = {
  customer_id: number;
  customer_name: string;
  customer_phone?: string;
  year_month: string;
  sales_summary: {
    date: string;
    sale_id: number;
    total: number;
  }[];
  total_debt: number;
};
