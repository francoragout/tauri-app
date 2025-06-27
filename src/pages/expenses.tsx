import { useQuery } from "@tanstack/react-query";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { ExpensesColumns } from "@/components/expenses/expenses-columns";
import { Expense, ExpenseSchema } from "@/lib/zod";
import { getDb } from "@/lib/db";

async function GetExpenses(): Promise<Expense[]> {
  const db = await getDb();
  const query = `
    SELECT 
      e.id, 
      datetime(e.created_at, '-3 hours') AS local_date,
      e.description, 
      e.amount,
	  e.payment_method,
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
    GROUP BY e.id, e.created_at, e.description, e.amount, e.payment_method;
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
