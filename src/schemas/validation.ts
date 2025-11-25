import { z } from "zod";
import { da } from "zod/v4/locales";

// ==============================
// Schema para Categoria
// ==============================
export const createCategoriaSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome da categoria deve ter pelo menos 2 caracteres")
    .max(100, "Nome da categoria deve ter no máximo 100 caracteres"),
});

export const updateCategoriaSchema = createCategoriaSchema.partial();

// ==============================
// Schema para Produto
// ==============================
export const createProdutoSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome do produto deve ter pelo menos 2 caracteres")
    .max(150, "Nome do produto deve ter no máximo 150 caracteres"),
  preco: z
    .number()
    .positive("Preço deve ser um número positivo"),
  estoque: z
    .number()
    .int("Estoque deve ser um número inteiro")
    .nonnegative("Estoque não pode ser negativo"),
  categoriaId: z
    .number()
    .int("ID da categoria deve ser um número inteiro")
    .positive("ID da categoria deve ser positivo"),
});

export const updateProdutoSchema = createProdutoSchema.partial();

export const getProductsQuerySchema = z.object({
  categoriaId: z.coerce.number().optional(),
});

// ==============================
// Schema para Cliente
// ==============================
export const createClienteSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .email({ message: "Email deve ter um formato válido" })
    .max(255, "Email deve ter no máximo 255 caracteres"),
  cpf: z
    .string()
    .length(11, "CPF deve ter exatamente 11 dígitos")
    .regex(/^\d+$/, "CPF deve conter apenas números"),
  telefone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 caracteres")
    .max(15, "Telefone deve ter no máximo 15 caracteres")
    .optional(),
  dataNascimento: z
    .string()
    .optional()
    .refine((date) => {
      if (date === undefined || date === null || date === "") return true;
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Data de nascimento deve ser válida")
    .refine((date) => {
      if (date === undefined || date === null || date === "") return true;
      const parsed = new Date(date);
      return parsed <= new Date();
    }, "Data de nascimento não pode ser no futuro"),
  senha: z
    .string()
    .min(4, "A senha deve ter pelo menos 4 caracteres")
    .regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
});

export const updateClienteSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  email: z.string().email().max(255).optional(),
  cpf: z.string().length(11).regex(/^\d+$/).optional(),

  telefone: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? undefined : val)),

  dataNascimento: z
  .string()
  .nullable()
  .optional()
  .transform((val) => {
    if (val === null || val === "") return undefined;
    return val;
  })
  .refine((date) => {
    if (date === undefined) return true;
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, "Data de nascimento deve ser válida")
  .refine((date) => {
    if (date === undefined) return true;
    const parsed = new Date(date);
    return parsed <= new Date();
  }, "Data de nascimento não pode ser no futuro"),

  senha: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val))
    .refine(
      (val) => val === undefined || val.length >= 4,
      "A senha deve ter pelo menos 4 caracteres"
    )
    .refine(
      (val) => val === undefined || /[a-zA-Z]/.test(val),
      "A senha deve conter pelo menos uma letra"
    )
    .refine(
      (val) => val === undefined || /[0-9]/.test(val),
      "A senha deve conter pelo menos um número"
    ),
});

// ==============================
// Schema para Pedido
// ==============================
export const createPedidoSchema = z.object({
  clienteId: z
    .number()
    .int("ID do cliente deve ser um número inteiro")
    .positive("ID do cliente deve ser positivo"),
  dataPedido: z
    .string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, "Data do pedido deve ser uma data válida")
    .refine((date) => {
      const parsedDate = new Date(date);
      const now = new Date();
      return parsedDate <= now;
    }, "Data do pedido não pode ser no futuro"),
});

export const updatePedidoSchema = createPedidoSchema.partial();

// ==============================
// Schema para PedidoItem 
// ==============================
export const createPedidoItemSchema = z.object({
  pedidoId: z
    .number()
    .int("ID do pedido deve ser um número inteiro")
    .positive("ID do pedido deve ser positivo"),
  produtoId: z
    .number()
    .int("ID do produto deve ser um número inteiro")
    .positive("ID do produto deve ser positivo"),
  quantidade: z
    .number()
    .int("Quantidade deve ser um número inteiro")
    .positive("Quantidade deve ser positiva"),
  precoUnitario: z
    .number()
    .positive("Preço unitário deve ser positivo"),
});

export const updatePedidoItemSchema = createPedidoItemSchema.partial();

// ==============================
// Schema para validação de IDs
// ==============================
export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID deve ser um número válido")
    .transform(Number)
    .refine((num) => num > 0, "ID deve ser positivo"),
});

// ==============================
// Tipos TypeScript derivados dos schemas
// ==============================
export type CreateCategoriaData = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaData = z.infer<typeof updateCategoriaSchema>;

export type CreateProdutoData = z.infer<typeof createProdutoSchema>;
export type UpdateProdutoData = z.infer<typeof updateProdutoSchema>;

export type CreateClienteData = z.infer<typeof createClienteSchema>;
export type UpdateClienteData = z.infer<typeof updateClienteSchema>;

export type CreatePedidoData = z.infer<typeof createPedidoSchema>;
export type UpdatePedidoData = z.infer<typeof updatePedidoSchema>;

export type CreatePedidoItemData = z.infer<typeof createPedidoItemSchema>;
export type UpdatePedidoItemData = z.infer<typeof updatePedidoItemSchema>;

export type IdParam = z.infer<typeof idParamSchema>;
