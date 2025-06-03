import { PaymentsColumns } from "@/components/payments/payments-columns";
import { PaymentsTable } from "@/components/payments/payments-table";
import { Payment, PaymentSchema } from "@/lib/zod";
import { useQuery } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";

async function GetPayments(): Promise<Payment[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const query = `
    SELECT 
      payments.id,
      datetime(payments.date, '-3 hours') AS local_date,
	  payments.customer_id,
	  customers.full_name AS customer_name,
	  payments.method,
      payments.amount
    FROM payments
	LEFT JOIN 
      customers ON payments.customer_id = customers.id
  `;
  const result = await db.select(query);
  return PaymentSchema.array().parse(result);
}

export default function Payments() {
  const { data = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: GetPayments,
  });

  return <PaymentsTable data={data} columns={PaymentsColumns} />;
}
