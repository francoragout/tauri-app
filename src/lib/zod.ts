import { z } from "zod";

export const PurchaseSchema = z.object({
  id: z.number().optional(),
  date: z.string().optional(),
  product_id: z.number({
    required_error: "Seleccione un producto",
  }),

  product_name: z.string().optional(),
  total: z.coerce
    .number({
      invalid_type_error: "Ingrese el total de la compra",
    })
    .min(1, {
      message: "El total de la compra debe ser mayor a 0",
    }),
  quantity: z.coerce
    .number({
      invalid_type_error: "Ingrese la cantidad del producto",
    })
    .min(1, {
      message: "La cantidad de compra debe ser mayor a 0",
    }),
});

export type Purchase = z.infer<typeof PurchaseSchema>;

export const ProductSchema = z.object({
  id: z.number().optional(),
  name: z.string().nonempty({
    message: "Ingrese el nombre del producto",
  }),
  category: z.string().nonempty({
    message: "Ingrese la categoría del producto",
  }),
  price: z.coerce
    .number({
      invalid_type_error: "Ingrese el precio del producto",
    })
    .min(1, {
      message: "El precio del producto debe ser mayor a 0",
    })
    .positive({
      message: "El precio del producto debe ser mayor a 0",
    }),
  stock: z.coerce
    .number({
      invalid_type_error: "Ingrese el stock del producto",
    })
    .int({
      message: "El stock debe ser un número entero",
    }),
  unit_price: z.number().optional(),
  times_sold: z.number().optional(),
});

export const SaleSchema = z.object({
  id: z.number().optional(),
  customer_id: z.number().optional(),
  date: z.string().optional(),
  payment_method: z.string(),
  surcharge_percent: z.number().optional(),
  is_paid: z.number().optional(),
  products: z.array(
    z.object({
      id: z.number().int(),
      quantity: z.number().int().positive(),
    })
  ),
});

export const SaleItemsSchema = z.object({
  id: z.number(),
  date: z.string(),
  products: z.string(),
  payment_method: z.string(),
  surcharge_percent: z.number(),
  total: z.number(),
  customer_id: z.number().nullable(),
  is_paid: z.number(),
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
  debt: z.number().optional(),
});
export const ExpenseSchema = z.object({
  id: z.number().optional(),
  product_id: z.number().nullish(),
  product_name: z.string().nullish(),
  date: z.string().optional(),
  category: z
    .string({
      required_error: "Ingrese la categoría del gasto",
    })
    .nonempty({
      message: "Ingrese la categoría del gasto",
    }),
  total: z.coerce
    .number({
      invalid_type_error: "Ingrese el total del gasto",
    })
    .min(1, {
      message: "El total del gasto debe ser mayor a 0",
    }),
  quantity: z.coerce
    .number({
      invalid_type_error: "Ingrese la cantidad del producto",
    })
    .int({
      message: "La cantidad debe ser un número entero",
    })
    .nullish(),
});

export type Product = z.infer<typeof ProductSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type SaleItems = z.infer<typeof SaleItemsSchema>;
export type Sale = z.infer<typeof SaleSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
