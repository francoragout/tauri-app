import { OwnersColumns } from "@/components/owners/owners-columns";
import { OwnersTable } from "@/components/owners/owners-table";
import { LoadingSkeleton } from "@/components/skeletons";
import { Owner, OwnerSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";

async function GetOwners(): Promise<Owner[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
    WITH sale_gains_cte AS (
    SELECT
      o.id AS owner_id,
      o.name,
      SUM(
        CASE
          WHEN s.is_paid = 1 THEN (s.total * po.percentage / 100.0)
          ELSE 0
        END
      ) AS sale_gains
    FROM owners o
    LEFT JOIN product_owners po ON o.id = po.owner_id
    LEFT JOIN sale_items si ON po.product_id = si.product_id
    LEFT JOIN sales s ON si.sale_id = s.id
    GROUP BY o.id, o.name
    ),
    purchase_costs_cte AS (
      SELECT
        po.owner_id,
        SUM(pu.total * po.percentage / 100.0) AS purchase_costs
      FROM purchases pu
      JOIN product_owners po ON pu.product_id = po.product_id
      GROUP BY po.owner_id
    ),
    expense_costs_cte AS (
      SELECT
        eo.owner_id,
        SUM(e.amount * eo.percentage / 100.0) AS expense_costs
      FROM expenses e
      JOIN expense_owners eo ON e.id = eo.expense_id
      GROUP BY eo.owner_id
    ),
    product_count_cte AS (
      SELECT
        po.owner_id,
        COUNT(DISTINCT po.product_id) AS product_count
      FROM product_owners po
      GROUP BY po.owner_id
    )

    SELECT
      o.id,
      o.name,
      IFNULL(sg.sale_gains, 0) - IFNULL(pc.purchase_costs, 0) - IFNULL(ec.expense_costs, 0) AS  net_gain,
      IFNULL(pc2.product_count, 0) AS product_count
    FROM owners o
    LEFT JOIN sale_gains_cte sg ON o.id = sg.owner_id
    LEFT JOIN purchase_costs_cte pc ON o.id = pc.owner_id
    LEFT JOIN expense_costs_cte ec ON o.id = ec.owner_id
    LEFT JOIN product_count_cte pc2 ON o.id = pc2.owner_id
    GROUP BY o.id, o.name;
`;
  const result = await db.select(query);

  return OwnerSchema.array().parse(result);
}

export default function Owners() {
  const { data = [], isPending } = useQuery({
    queryKey: ["owners"],
    queryFn: GetOwners,
  });

  if (isPending) {
    return <LoadingSkeleton />;
  }

  return <OwnersTable data={data} columns={OwnersColumns} />;
}
