import { OwnersColumns } from "@/components/owners/owners-columns";
import { OwnersTable } from "@/components/owners/owners-table";
import { getDb } from "@/lib/db";
import { Owner, OwnerSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";

async function GetOwners(): Promise<Owner[]> {
  const db = await getDb();
  const query = `
    WITH
      owner_sale_share AS (
        SELECT
          s.id AS sale_id,
          po.owner_id,
          SUM(si.quantity * po.percentage / 100.0) AS owner_share,
          (
            SELECT SUM(si2.quantity * po2.percentage / 100.0)
            FROM sale_items si2
            JOIN product_owners po2 ON si2.product_id = po2.product_id
            WHERE si2.sale_id = s.id
          ) AS total_share,
          s.total AS sale_total
        FROM sales s
        JOIN sale_items si ON si.sale_id = s.id
        JOIN product_owners po ON si.product_id = po.product_id
        GROUP BY s.id, po.owner_id
      ),

      sales_per_owner AS (
        SELECT
          owner_id,
          SUM(
            CASE 
              WHEN total_share > 0 THEN sale_total * (owner_share / total_share)
              ELSE 0
            END
          ) AS sales_total
        FROM owner_sale_share
        GROUP BY owner_id
      ),

      purchases_per_owner AS (
        SELECT
          po.owner_id,
          SUM(p.total * (po.percentage / 100.0)) AS purchases_total
        FROM purchases p
        JOIN product_owners po ON p.product_id = po.product_id
        GROUP BY po.owner_id
      ),

      expenses_per_owner AS (
        SELECT
          eo.owner_id,
          SUM(e.amount * (eo.percentage / 100.0)) AS expenses_total
        FROM expenses e
        JOIN expense_owners eo ON e.id = eo.expense_id
        GROUP BY eo.owner_id
      ),
      
      products_per_owner AS (
        SELECT
          owner_id,
          COUNT(DISTINCT product_id) AS total_products
        FROM product_owners
        GROUP BY owner_id
      )

    SELECT
      o.id,
      o.name,
    	o.alias,
      IFNULL(prod.total_products, 0) AS total_products,
      IFNULL(s.sales_total, 0) - IFNULL(p.purchases_total, 0) - IFNULL(e.expenses_total, 0) AS    net_profit
    FROM owners o
    LEFT JOIN products_per_owner prod ON o.id = prod.owner_id
    LEFT JOIN sales_per_owner s ON o.id = s.owner_id
    LEFT JOIN purchases_per_owner p ON o.id = p.owner_id
    LEFT JOIN expenses_per_owner e ON o.id = e.owner_id
    ORDER BY net_profit DESC;
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
