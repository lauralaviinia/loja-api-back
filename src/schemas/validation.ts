import { z } from "zod";

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

  preco: z.number().positive("Preço deve ser um número positivo"),

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
  nome: z.string().min(2).max(100),

  email: z.string().email().max(255),

  cpf: z.string().length(11).regex(/^\d+$/),

  telefone: z.string().min(10).max(15).optional(),

  dataNascimento: z.string().optional(),

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

  telefone: z.string().min(10).max(15).optional().nullable(),

  dataNascimento: z.string().optional().nullable(),

  senha: z.string().optional(),
});

// ==============================
// Schema para PedidoItem (item de um pedido)
// ==============================
export const pedidoItemSchema = z.object({
  produtoId: z
    .number()
    .int("ID do produto deve ser um número inteiro")
    .positive("ID do produto deve ser positivo"),
  quantidade: z
    .number()
    .int("Quantidade deve ser um número inteiro")
    .positive("Quantidade deve ser maior que zero")
    .max(10000, "Quantidade não pode exceder 10.000 unidades"),
});

// ==============================
// Schema para Pedido (criação com itens)
// ==============================
export const createPedidoSchema = z.object({
  clienteId: z
    .number()
    .int("ID do cliente deve ser um número inteiro")
    .positive("ID do cliente deve ser positivo"),

  data: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, "Data do pedido deve ser uma data válida (ISO 8601)"),

  items: z
    .array(pedidoItemSchema)
    .min(1, "Pedido deve conter pelo menos um item")
    .max(100, "Pedido não pode exceder 100 itens"),
});

export const updatePedidoSchema = z.object({
  status: z
    .enum(["PENDENTE", "PAGO", "PROCESSANDO", "ENVIADO", "ENTREGUE", "CANCELADO"])
    .optional(),
  items: z.array(pedidoItemSchema).optional(),
});

// ==============================
// Schema para PedidoItem 
// ==============================
export const createPedidoItemSchema = z.object({
  pedidoId: z.number().int().positive(),
  produtoId: z.number().int().positive(),
  quantidade: z.number().int().positive(),
  precoUnitario: z.number().positive(),
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
