import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import Database from "@tauri-apps/plugin-sql";

async function GetTodaySalesTotal(): Promise<number> {
  const db = await Database.load("sqlite:mydatabase.db");

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

  const result = (await db.select(query, [today])) as { total: number }[];
  return result[0]?.total || 0;
}

export default function Dashboard() {
  // const { data: todaySalesTotal = 0 } = useQuery({
  //   queryKey: ["todaySalesTotal"],
  //   queryFn: GetTodaySalesTotal,
  //   refetchInterval: 1000 * 60, // Refresca cada minuto
  // });
  return (
    <div className="flex flex-col gap-4 md:gap-6 md:py-6">
      <SectionCards />
      <ChartAreaInteractive />
    </div>
  );
}
