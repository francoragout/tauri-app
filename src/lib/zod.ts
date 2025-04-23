import { z } from "zod";

export const ProductSchema = z.object({
  id: z.number().optional(),
  brand: z.string().nonempty({
    message: "Ingrese el nombre del producto",
  }),
  variant: z.string().optional(),
  weight: z.string().optional(),
  category: z.string().nonempty({
    message: "Ingrese la categoría del producto",
  }),
  price: z.coerce
    .number({
      invalid_type_error: "Ingrese el precio del producto",
    })
    .min(1, {
      message: "El precio de venta debe ser mayor a 0",
    }),
  stock: z.coerce
    .number({
      invalid_type_error: "Ingrese el stock del producto",
    })
    .int({
      message: "El stock debe ser un número entero",
    }),
  times_sold: z.number().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

// 📤 Esquema para crear una venta con productos

export const SaleSchema = z.object({
  id: z.number().optional(),
  total: z.number(),
  date: z.string().optional(),
  customer_id: z.number().optional(),
  is_paid: z.number().default(0).optional(),
  items: z.array(
    z.object({
      product_id: z.number().int(),
      quantity: z.number().int().positive(),
    })
  ),
});

// 📥 Esquemas de respuesta para JOIN plano
// Basado en tu SQL JOIN entre sales, sale_items y products

export const SaleItemsSchema = z.object({
  sale_id: z.number(),
  sale_date: z.string(),
  sale_total: z.number(),
  products_summary: z.string().nullable(), // Nuevo campo para los productos combinados
  customer_info: z.string().nullable(), // Nuevo campo para la información del cliente
});

export const CustomerSchema = z.object({
  id: z.number().optional(),
  full_name: z
    .string({
      required_error: "Ingrese el nombre completo del cliente",
    })
    .nonempty({
      message: "Ingrese el nombre completo del cliente",
    }),
  reference: z.string().optional(),
  phone: z.string().optional(),
});

export const ExtendedCustomerSchema = CustomerSchema.extend({
  total_sales_amount: z.number().nullable(),
  sales_details: z.string().nullable(),
});

export const ExpenseSchema = z.object({
  id: z.number().optional(),
  date: z.string().optional(),
  amount: z.coerce
    .number({
      invalid_type_error: "Ingrese el monto del gasto",
    })
    .min(1, {
      message: "El monto debe ser mayor a 0",
    }),
  category: z
    .string({
      required_error: "Ingrese la categoría del gasto",
    })
    .nonempty({
      message: "Ingrese la categoría del gasto",
    }),
  description: z.string().optional(),
});

export type Expense = z.infer<typeof ExpenseSchema>;
export type SaleItems = z.infer<typeof SaleItemsSchema>;
export type Sale = z.infer<typeof SaleSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type ExtendedCustomer = z.infer<typeof ExtendedCustomerSchema>;
