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
      e.id, 
      datetime(e.date, '-3 hours') AS local_date,
      e.category,
      e.description, 
      e.amount,
      json_group_array(
        DISTINCT json_object(
          'id', o.id,
          'name', o.name,
          'percentage', eo.percentage
        )
      ) AS owners
    FROM expenses e
    LEFT JOIN expense_owners eo ON e.id = eo.expense_id
    LEFT JOIN owners o ON eo.owner_id = o.id
    GROUP BY e.id, e.date, e.category, e.description, e.amount;
  `;
  const result = (await db.select(query)) as any[];

  const parsed = result.map((row: any) => ({
    ...row,
    owners: JSON.parse(row.owners),
  }));

  return ExpenseSchema.array().parse(parsed);
}

export default function Expenses() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: GetExpenses,
  });

  return (
    <ExpensesTable
      data={data}
      columns={ExpensesColumns}
      isLoading={isLoading}
    />
  );
}
