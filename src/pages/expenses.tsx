import Database from "@tauri-apps/plugin-sql";
import "../App.css";
import { useQuery } from "@tanstack/react-query";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { ExpensesColumns } from "@/components/expenses/expenses-columns";
import { Expense, ExpenseSchema, Product, ProductSchema } from "@/lib/zod";

async function GetExpenses(): Promise<Expense[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
    SELECT 
      expenses.id, 
      expenses.date, 
      expenses.category, 
      products.name AS product_name, 
      expenses.product_id,
      expenses.total, 
      expenses.quantity 
    FROM expenses 
    LEFT JOIN products ON products.id = expenses.product_id
  `;
  const result = await db.select(query);
  return ExpenseSchema.array().parse(result);
}

export async function GetProducts(): Promise<Product[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const result = await db.select(`SELECT * FROM products`);
  return ProductSchema.array().parse(result);
}

export default function Expenses() {
  const { data = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: GetExpenses,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: GetProducts,
  });

  return (
    <ExpensesTable data={data} columns={ExpensesColumns} products={products} />
  );
}
