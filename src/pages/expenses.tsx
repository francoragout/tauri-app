import Database from "@tauri-apps/plugin-sql";
import "../App.css";
import { useQuery } from "@tanstack/react-query";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { ExpensesColumns } from "@/components/expenses/expenses-columns";
import { Expense, ExpenseSchema } from "@/lib/zod";

async function GetExpenses(): Promise<Expense[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const result = await db.select(`SELECT * FROM expenses`);
  return ExpenseSchema.array().parse(result);
}

export default function Expenses() {
  const { data = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: GetExpenses,
  });

  return <ExpensesTable data={data} columns={ExpensesColumns} />;
}
