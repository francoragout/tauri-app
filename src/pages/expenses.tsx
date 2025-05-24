import Database from "@tauri-apps/plugin-sql";
import "../App.css";
import { useQuery } from "@tanstack/react-query";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { ExpensesColumns } from "@/components/expenses/expenses-columns";
import { Expense, ExpenseSchema } from "@/lib/zod";

async function GetExpenses(): Promise<Expense[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
  SELECT 
      expenses.id, 
      datetime(expenses.date, '-3 hours') AS local_date,
      expenses.category,
      expenses.description, 
      expenses.amount
    FROM expenses 
  `;
  const result = await db.select(query);
  return ExpenseSchema.array().parse(result);
}

export default function Expenses() {
  const { data = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: GetExpenses,
  });

  return <ExpensesTable data={data} columns={ExpensesColumns} />;
}
