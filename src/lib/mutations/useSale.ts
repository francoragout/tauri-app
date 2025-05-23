import { useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { Payment, Sale } from "../zod";

export function GetSales(): Promise<Sale[]> {
  return Database.load("sqlite:mydatabase.db").then((db) =>
    db.select(`SELECT * FROM sales`)
  );
}

export function CreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Sale) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // 1. Verificar stock de los productos
      for (const product of values.products) {
        const stockResult = await db.select<{ stock: number }[]>(
          `SELECT stock FROM products WHERE id = $1`,
          [product.id]
        );

        const stock = stockResult[0]?.stock ?? 0;

        if (stock < product.quantity) {
          // Obtener detalles del producto
          const productResult = await db.select<{ name: string }[]>(
            `SELECT name FROM products WHERE id = $1`,
            [product.id]
          );

          const productBrand = productResult[0]?.name;

          throw new Error(`Stock insuficiente: ${productBrand}`);
        }
      }

      // 2. Insertar en sales
      await db.execute(
        `INSERT INTO sales (payment_method, surcharge_percent, customer_id, is_paid, total) VALUES ($1, $2, $3, $4, $5)`,
        [
          values.payment_method,
          values.surcharge_percent,
          values.customer_id,
          values.is_paid,
          values.total,
        ]
      );

      // 3. Obtener el ID de la venta recién insertada
      const saleIdResult = await db.select<{ id: number }[]>(
        `SELECT last_insert_rowid() as id`
      );

      const saleId = saleIdResult[0].id;

      // 4. Insertar products y actualizar stock
      for (const product of values.products) {
        // Obtener el precio actual del producto
        const priceResult = await db.select<{ price: number }[]>(
          `SELECT price FROM products WHERE id = $1`,
          [product.id]
        );

        const productPrice = priceResult[0].price;

        // Insertar en sale_items con el precio actual
        await db.execute(
          `INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
          [saleId, product.id, product.quantity, productPrice]
        );

        // Actualizar el stock del producto
        await db.execute(
          `UPDATE products SET stock = stock - $1 WHERE id = $2`,
          [product.quantity, product.id]
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function DeleteSales() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // 1. Recuperar los productos y cantidades de las ventas
      const saleProducts = await db.select<
        { product_id: number; quantity: number }[]
      >(
        `SELECT product_id, quantity FROM sale_items WHERE sale_id IN (${ids.join(
          ","
        )})`
      );

      // 2. Revertir el stock de los productos
      for (const product of saleProducts) {
        await db.execute(
          `UPDATE products SET stock = stock + $1 WHERE id = $2`,
          [product.quantity, product.product_id]
        );
      }

      // 3. Eliminar las ventas
      await db.execute(`DELETE FROM sales WHERE id IN (${ids.join(",")})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

export function PaySales() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Payment) => {
      const db = await Database.load("sqlite:mydatabase.db");

      // 1. Buscar todas las ventas del cliente que no estén pagadas
      const sales = await db.select<{ id: number }[]>(
        `SELECT id FROM sales WHERE customer_id = $1 AND is_paid = 0`,
        [values.customer_id]
      );

      // 2. Actualizar cada venta: total (con recargo), pagada, método de pago y recargo
      for (const sale of sales) {
        // Calcular el total base de la venta
        const totalResult = await db.select<{ total: number }[]>(
          `SELECT SUM(price * quantity) as total FROM sale_items WHERE sale_id = $1`,
          [sale.id]
        );
        const totalBase = totalResult[0]?.total ?? 0;

        // Calcular el total con recargo
        const surchargePercent = values.surcharge_percent ?? 0;
        const surcharge = (totalBase * surchargePercent) / 100;
        const totalWithSurcharge = totalBase + surcharge;

        await db.execute(
          `UPDATE sales SET is_paid = 1, payment_method = $1, surcharge_percent = $2, total = $3 WHERE id = $4`,
          [
            values.payment_method,
            values.surcharge_percent,
            totalWithSurcharge,
            sale.id,
          ]
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
