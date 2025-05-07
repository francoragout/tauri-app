import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import Database from "@tauri-apps/plugin-sql";
import React from "react";

async function GetTodaySalesTotal(): Promise<number> {
  const db = await Database.load("sqlite:mydatabase.db");

  // Define el tipo esperado para el resultado de la consulta
  type QueryResult = { total: number | null };

  // Obtén la fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  const query = `
  SELECT
    SUM(sale_items.price * sale_items.quantity) * (1 + IFNULL(sales.surcharge_percent, 0) / 100.0) AS total
  FROM
    sales
  LEFT JOIN sale_items ON sale_items.sale_id = sales.id
  WHERE
    sales.is_paid = 1 AND DATE(sales.date) = ?
  `;

  // Usa una aserción de tipo para el resultado
  const result = await db.select(query, [today]) as QueryResult[];

  // Devuelve el total o 0 si no hay resultados
  return result[0]?.total || 0;
}

export default function Dashboard() {
  const [todaySalesTotal, setTodaySalesTotal] = React.useState(0);

  React.useEffect(() => {
    async function fetchTodaySales() {
      const total = await GetTodaySalesTotal();
      setTodaySalesTotal(total);
    }
    fetchTodaySales();
  }, []);

  return (
    <div className="flex flex-col gap-4 md:gap-6 md:py-6">
      <h1>Total de ventas de hoy: ${todaySalesTotal.toFixed(2)}</h1>
      <SectionCards />
      <ChartAreaInteractive />
    </div>
  );
}
