import { OwnersColumns } from "@/components/owners/owners-columns";
import { OwnersTable } from "@/components/owners/owners-table";
import { getDb } from "@/lib/db";
import { Owner, OwnerSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";

async function GetOwners(): Promise<Owner[]> {
  const db = await getDb();
  const query = `
    WITH product_count_cte AS (
      SELECT
        po.owner_id,
        COUNT(DISTINCT po.product_id) AS product_count
      FROM product_owners po
      GROUP BY po.owner_id
    )

    SELECT
      o.id,
      o.name,
      o.alias,   
      IFNULL(pc2.product_count, 0) AS product_count
    FROM owners o
    LEFT JOIN product_count_cte pc2 ON o.id = pc2.owner_id
    GROUP BY o.id, o.name;
  `;

  const result = await db.select(query);

  return OwnerSchema.array().parse(result);
}

export default function Owners() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["owners"],
    queryFn: GetOwners,
  });

  return (
    <OwnersTable data={data} columns={OwnersColumns} isLoading={isLoading} />
  );
}
