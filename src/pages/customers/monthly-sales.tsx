import { MonthlySalesColumns } from "@/components/customers/monthly-sales/monthly-sales-columns";
import { MonthlySalesTable } from "@/components/customers/monthly-sales/monthy-sales-table";
import type { MonthlySales } from "@/lib/zod";
import { MonthlySalesSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { useParams } from "react-router";

async function GetMonthlySales(id: string): Promise<MonthlySales[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
    SELECT
      CAST(strftime('%Y', datetime(s.date, '-3 hours')) AS INTEGER) AS year,
      CAST(strftime('%m', datetime(s.date, '-3 hours')) AS INTEGER) AS month,
      json_group_array(
        json_object(
          'id', s.id,
          'date', datetime(s.date, '-3 hours'),
          'total', sale_total
        )
      ) AS sales_summary,
      SUM(sale_total) AS debt
    FROM sales s
    JOIN (
      SELECT
        sale_id,
        SUM(quantity * price) AS sale_total
      FROM sale_items
      GROUP BY sale_id
    ) AS totals ON totals.sale_id = s.id
    WHERE s.customer_id = $1
      AND s.is_paid = 0
    GROUP BY year, month
    ORDER BY year, month;
  `;
  const result = (await db.select(query, [id])) as any[];

  const parsed = result.map((row: any) => ({
    ...row,
    customer_id: Number(id), // Agrega el customer_id aquí
    sales_summary: JSON.parse(row.sales_summary),
  }));

  return MonthlySalesSchema.array().parse(parsed);
}

export default function MonthlySales() {
  const { id } = useParams<{ id: string }>();

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["monthly-sales", id],
    queryFn: () => GetMonthlySales(id!),
    enabled: !!id, // evita ejecutar si no hay id
  });

  if (!id) return <div>Cliente no especificado.</div>;
  if (isLoading) return <div>Cargando ventas mensuales...</div>;
  if (isError) return <div>Error al cargar las ventas mensuales.</div>;

  return <MonthlySalesTable data={data} columns={MonthlySalesColumns} />;
}