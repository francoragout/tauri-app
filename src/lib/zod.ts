import { z } from "zod";

export const PurchaseSchema = z.object({
  id: z.number().optional(),
  local_date: z.string().optional(),
  product_id: z.number({
    required_error: "Seleccione un producto",
  }),
  product_name: z.string().optional(),
  supplier_id: z.number().nullish(),
  supplier_name: z.string().nullish(),
  quantity: z.coerce
    .number({
      invalid_type_error: "Ingrese la cantidad del producto",
    })
    .min(1, {
      message: "La cantidad de compra debe ser mayor a 0",
    }),
  total: z.coerce
    .number({
      required_error: "Ingrese el total de la compra",
      invalid_type_error: "Ingrese el total de la compra",
    })
    .min(1, {
      message: "El total de la compra debe ser mayor a 0",
    }),
  payment_method: z.string({
    required_error: "Seleccione un método de pago",
  }),
});

export const ProductSchema = z.object({
  id: z.number().optional(),
  name: z
    .string({
      required_error: "Ingrese el nombre del producto",
    })
    .nonempty({
      message: "Ingrese el nombre del producto",
    }),
  category: z
    .string({
      required_error: "Ingrese la categoría del producto",
    })
    .nonempty({
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
  unit_price: z.number().nullish(),
  times_sold: z.number().optional(),
});

export const SaleSchema = z
  .object({
    id: z.number().optional(),
    local_date: z.string().optional(),
    is_paid: z.number(),
    customer_id: z.number().nullish(),
    customer_name: z.string().nullish(),
    payment_method: z.string(),
    surcharge: z.number(),
    total: z.number(),
    products: z.array(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        quantity: z.number(),
      })
    ),
  })
  .refine(
    (data) =>
      data.payment_method !== "account" ||
      (data.customer_id !== null && data.customer_id !== undefined),
    {
      message: "Seleccione un cliente",
      path: ["customer_id"],
    }
  );

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
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 10, {
      message: "El número de teléfono debe tener 10 dígitos",
    }),
  total_debt: z.number().optional(),
});

export const ExpenseSchema = z.object({
  id: z.number().optional(),
  local_date: z.string().optional(),
  category: z.string().nonempty({
    message: "Ingrese la categoría del gasto",
  }),
  amount: z.coerce
    .number({
      invalid_type_error: "Ingrese el total del gasto",
    })
    .min(1, {
      message: "El total del gasto debe ser mayor a 0",
    }),
  description: z.string().optional(),
});

export const PaymentSchema = z.object({
  id: z.number().optional(),
  local_date: z.string().optional(),
  customer_id: z.number({
    required_error: "Seleccione un cliente",
  }),
  customer_name: z.string().optional(),
  method: z.string({
    required_error: "Seleccione un método de pago",
  }),
  surcharge: z.number(),
  amount: z.number(),
  period: z.string().optional(),
});

export const SupplierSchema = z.object({
  id: z.number().optional(),
  name: z
    .string({
      required_error: "Ingrese el nombre del proveedor",
    })
    .nonempty({
      message: "Ingrese el nombre del proveedor",
    }),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 10, {
      message: "El número de teléfono debe tener 10 dígitos",
    }),
  address: z.string().optional(),
  products: z
    .array(
      z.object({
        id: z.number(),
        name: z.string().optional(),
      })
    )
    .nullish(),
});

export const MonthlySalesSchema = z.object({
  customer_id: z.number(),
  period: z.string(),
  sales_summary: z.array(
    z.object({
      id: z.number(),
      date: z.string(),
      total: z.number(),
    })
  ),
  debt: z.number(),
});

export type Payment = z.infer<typeof PaymentSchema>;
export type Purchase = z.infer<typeof PurchaseSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Sale = z.infer<typeof SaleSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type Supplier = z.infer<typeof SupplierSchema>;
export type MonthlySales = z.infer<typeof MonthlySalesSchema>;
