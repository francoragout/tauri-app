import { BillsColumns } from "@/components/bills/bills-columns";
import { BillsTable } from "@/components/bills/bills-table";
import { getDb } from "@/lib/db";
import { Bill } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

async function getBills(): Promise<Bill[]> {
  const db = await getDb();
  const query = `
    WITH 
      sale_totals AS (
        SELECT 
          s.id AS sale_id,
          s.customer_id,
          strftime('%Y-%m', datetime(s.created_at, '-3 hours')) AS year_month,
          date(datetime(s.created_at, '-3 hours')) AS date,
          SUM(si.quantity * p.price) AS total
        FROM sales s
        JOIN sale_items si ON si.sale_id = s.id
        JOIN products p ON p.id = si.product_id
        WHERE s.paid_at IS NULL
        GROUP BY s.id
      )

    SELECT 
      c.id AS customer_id,
      c.name AS customer_name,
      c.phone AS customer_phone,
      st.year_month,

      json_group_array(
        json_object(
          'date', st.date,
          'sale_id', st.sale_id,
          'total', st.total
        )
      ) AS sales_summary,
      SUM(st.total) AS total_debt 
    FROM sale_totals st
    JOIN customers c ON c.id = st.customer_id
    GROUP BY c.id, c.name, st.year_month
    ORDER BY st.year_month, c.name;
  `;
  const result = (await db.select(query)) as any[];

  const parsed: Bill[] = result.map((row: any) => ({
    customer_id: row.customer_id,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone || undefined, // Ensure phone is optional
    year_month: row.year_month,
    sales_summary: JSON.parse(row.sales_summary),
    total_debt: row.total_debt,
  }));

  return parsed;
}

export default function Bills() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["bills"],
    queryFn: getBills,
  });

  console.log("Fetched bills:", data);

  return (
    <BillsTable data={data} columns={BillsColumns} isLoading={isLoading} />
  );
}
