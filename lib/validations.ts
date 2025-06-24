import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  size: z.string().optional(),
  cost_price: z.number().min(0, "Preço de custo deve ser positivo"),
  sale_price: z.number().min(0, "Preço de venda deve ser positivo"),
  stock_quantity: z
    .number()
    .int()
    .min(0, "Quantidade deve ser um número inteiro positivo"),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  document: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2, "Estado deve ter 2 caracteres").optional(),
  zip_code: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean(),
});

export const saleSchema = z.object({
  product_id: z.number().int().positive("Produto é obrigatório"),
  customer_id: z.number().int().positive().optional().nullable(),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
  unit_price: z.number().positive("Preço unitário deve ser positivo"),
  discount: z.number().min(0, "Desconto deve ser positivo").optional(),
  notes: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
