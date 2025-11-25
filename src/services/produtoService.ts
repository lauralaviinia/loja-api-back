import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const ProdutoCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  descricao: z.string().max(1000).optional(),
  preco: z.number().positive('Preço deve ser positivo').max(999999.99, 'Preço muito alto'),
  estoque: z.number().int('Estoque deve ser inteiro').min(0, 'Estoque não pode ser negativo'),
  categoriaId: z.number().int('Categoria ID deve ser inteiro').positive('Categoria ID deve ser positivo').optional(),
});

export const ProdutoUpdateSchema = ProdutoCreateSchema.partial();

export class ProdutoService {

  async findAll(filters?: { categoriaId?: number }) {
    try {
      return await prisma.produto.findMany({
        where: filters, 
        include: {
          categoria: {
            select: {
              id: true,
              nome: true,
            }
          }
        },
        orderBy: {
          nome: 'asc'
        }
      });
    } catch (error) {
      throw new Error('Erro ao buscar produtos');
    }
  }

  async findById(id: number) {
    try {
      return await prisma.produto.findUnique({
        where: { id },
        include: {
          categoria: true,
          items: {
            include: {
              pedido: {
                select: {
                  id: true,
                  data: true,
                  status: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      throw new Error('Erro ao buscar produto');
    }
  }

  async create(data: any) {
    try {
      const validatedData = ProdutoCreateSchema.parse(data);

      if (validatedData.categoriaId) {
        const categoria = await prisma.categoria.findUnique({
          where: { id: validatedData.categoriaId }
        });

        if (!categoria) {
          throw new Error('Categoria não encontrada');
        }
      }

      return await prisma.produto.create({
        data: validatedData,
        include: {
          categoria: true
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Dados inválidos: ${error.issues.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  async update(id: number, data: any) {
    try {
      const validatedData = ProdutoUpdateSchema.parse(data);

      const produto = await this.findById(id);
      if (!produto) {
        throw new Error('Produto não encontrado');
      }

      if (validatedData.categoriaId) {
        const categoria = await prisma.categoria.findUnique({
          where: { id: validatedData.categoriaId }
        });

        if (!categoria) {
          throw new Error('Categoria não encontrada');
        }
      }

      return await prisma.produto.update({
        where: { id },
        data: validatedData,
        include: {
          categoria: true
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Dados inválidos: ${error.issues.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const produto = await this.findById(id);
      if (!produto) {
        throw new Error('Produto não encontrado');
      }

      const pedidosCount = await prisma.pedidoItem.count({
        where: { produtoId: id }
      });

      if (pedidosCount > 0) {
        throw new Error('Não é possível excluir produto com pedidos associados');
      }

      await prisma.produto.delete({
        where: { id }
      });
    } catch (error) {
      throw error;
    }
  }

  async findByCategoria(categoriaId: number) {
    try {
      return await prisma.produto.findMany({
        where: { categoriaId },
        include: {
          categoria: true
        },
        orderBy: {
          nome: 'asc'
        }
      });
    } catch (error) {
      throw new Error('Erro ao buscar produtos por categoria');
    }
  }

  async updateEstoque(id: number, quantidade: number) {
    try {
      const produto = await this.findById(id);
      if (!produto) {
        throw new Error('Produto não encontrado');
      }

      const novoEstoque = produto.estoque + quantidade;
      if (novoEstoque < 0) {
        throw new Error('Estoque insuficiente');
      }

      return await prisma.produto.update({
        where: { id },
        data: { estoque: novoEstoque },
        include: {
          categoria: true
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async count() {
    try {
      return await prisma.produto.count();
    } catch (error) {
      throw new Error('Erro ao contar produtos');
    }
  }
}
