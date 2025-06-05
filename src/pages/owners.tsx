import { OwnersColumns } from "@/components/owners/owners-columns";
import { OwnersTable } from "@/components/owners/owners-table";
import { Owner, OwnerSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";

async function GetOwners(): Promise<Owner[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
    SELECT
        o.id,
        o.name,
        CASE
            WHEN COUNT(p.id) = 0 THEN NULL
            ELSE json_group_array(
                json_object(
                    'id', p.id, 
                    'name', p.name,
                    'percentage', po.percentage
                )
            )       
        END AS products
    FROM owners o
    LEFT JOIN product_owners po ON o.id = po.owner_id
    LEFT JOIN products p ON po.product_id = p.id
    GROUP BY o.id
`;
  const result = (await db.select(query)) as any[];

  const parsed = result.map((row: any) => ({
    ...row,
    products: JSON.parse(row.products),
  }));

  return OwnerSchema.array().parse(parsed);
}

export default function Owners() {
  const { data = [] } = useQuery({
    queryKey: ["owners"],
    queryFn: GetOwners,
  });

  return <OwnersTable data={data} columns={OwnersColumns} />;
}
