import { z } from "zod";

export const ProductSchema = z.object({
  id: z.number().optional(),
  name: z.string().nonempty({
    message: "Ingrese el nombre del producto",
  }),
  variant: z.string().optional(),
  weight: z.coerce
    .number({
      invalid_type_error: "Solo se permiten números enteros y decimales",
    })
    .optional(),
  unit: z.enum(["kg", "g", "l", "ml", "unidad"]).optional(),
  category: z.string().nonempty({
    message: "Seleccione la categoría del producto",
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
    })
    .min(1, {
      message: "El stock debe ser mayor a 0",
    }),
});

export const SaleSchema = z.object({
  id: z.number().optional(),
  date: z.string().optional(),
  total: z.number(),
});

export type Product = z.infer<typeof ProductSchema>;
export type Sale = z.infer<typeof SaleSchema>;
