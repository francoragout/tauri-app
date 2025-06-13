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
    .trim()
    .nonempty({
      message: "Ingrese el nombre del producto",
    }),
  category: z
    .string({
      required_error: "Ingrese la categoría del producto",
    })
    .trim()
    .nonempty({
      message: "Ingrese la categoría del producto",
    }),
  price: z.coerce
    .number({
      invalid_type_error: "Ingrese el precio del producto",
    })
    .min(1, {
      message: "El precio del producto debe ser mayor a 0",
    }),
  stock: z.coerce
    .number({
      invalid_type_error: "Ingrese el stock del producto",
    })
    .int({
      message: "El stock debe ser un número entero",
    }),
  low_stock_threshold: z.coerce
    .number({
      invalid_type_error: "Ingrese el umbral de bajo stock del producto",
    })
    .int({
      message: "El umbral de stock bajo debe ser un número entero",
    }),
  unit_price: z.number().nullish(),
  times_sold: z.number().optional(),
  owners: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        percentage: z.number(),
      })
    )
    .refine((owners) => owners.length > 0, {
      message: "Seleccione al menos un propietario",
    })
    .refine(
      (owners) => owners.reduce((acc, o) => acc + o.percentage, 0) === 100,
      {
        message: "La suma de los porcentajes de los propietarios debe ser 100.",
      }
    ),
});

export const OwnerSchema = z.object({
  id: z.number().optional(),
  name: z
    .string({
      required_error: "Ingrese el nombre del propietario",
    })
    .trim()
    .nonempty({
      message: "Ingrese el nombre del propietario",
    }),
  product_count: z.number().optional(),
  net_gain: z.number().optional(),
});

export const SaleSchema = z
  .object({
    id: z.number().optional(),
    local_date: z.string().optional(),
    is_paid: z.number(),
    paid_at: z.string().nullish(),
    customer_id: z.number().nullish(),
    customer_name: z.string().nullish(),
    payment_method: z.string(),
    surcharge: z.number(),
    total: z.number(),
    products: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        quantity: z.number(),
        price: z.number().optional(),
        stock: z.number().optional(),
        low_stock_threshold: z.number().optional(),
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
  name: z
    .string({
      required_error: "Ingrese el nombre completo del cliente",
    })
    .trim()
    .nonempty({
      message: "Ingrese el nombre completo del cliente",
    }),
  reference: z.string().trim().optional(),
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
  category: z.string().trim().nonempty({
    message: "Ingrese la categoría del gasto",
  }),
  description: z.string().trim().optional(),
  amount: z.coerce
    .number({
      invalid_type_error: "Ingrese el total del gasto",
    })
    .min(1, {
      message: "El total del gasto debe ser mayor a 0",
    }),
  owners: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        percentage: z.number(),
      })
    )
    .refine((owners) => owners.length > 0, {
      message: "Seleccione al menos un propietario",
    })
    .refine(
      (owners) => owners.reduce((acc, o) => acc + o.percentage, 0) === 100,
      {
        message: "La suma de los porcentajes de los propietarios debe ser 100.",
      }
    ),
});

export const SupplierSchema = z.object({
  id: z.number().optional(),
  name: z
    .string({
      required_error: "Ingrese el nombre del proveedor",
    })
    .trim()
    .nonempty({
      message: "Ingrese el nombre del proveedor",
    }),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 10, {
      message: "El número de teléfono debe tener 10 dígitos",
    }),
  address: z.string().trim().optional(),
  products: z
    .array(
      z.object({
        id: z.number(),
        name: z.string().optional(),
      })
    )
    .nullish(),
});

export const BillSchema = z.object({
  customer_id: z.number(),
  customer_name: z.string(),
  year_month: z.string(),
  sales_summary: z.array(
    z.object({
      date: z.string(),
      sale_id: z.number(),
      total: z.number(),
    })
  ),
  payment_method: z.string().optional(),
  surcharge: z.number().optional(),
  total_debt: z.number(),
});

export const NotificationSchema = z.object({
  id: z.number(),
  title: z.string(),
  message: z.string(),
  link: z.string(),
  is_read: z.boolean(),
  local_date: z.string(),
});

export type Notification = z.infer<typeof NotificationSchema>;
export type Bill = z.infer<typeof BillSchema>;
export type Purchase = z.infer<typeof PurchaseSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Sale = z.infer<typeof SaleSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type Supplier = z.infer<typeof SupplierSchema>;
export type Owner = z.infer<typeof OwnerSchema>;
