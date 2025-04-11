import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  variant: z.string().nullable(),
  weight: z.object({
    value: z.string().optional(),
    unit: z.string().optional(),
  }),
  category: z.string(),
  purchase_price: z.coerce.number(),
  sale_price: z.coerce.number(),
  stock: z.coerce.number(),
});

export type Product = z.infer<typeof ProductSchema>;