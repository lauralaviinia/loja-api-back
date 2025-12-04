import { PrismaClient } from '@prisma/client';
import { createCategoriaSchema, updateCategoriaSchema } from '../schemas/validation';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

export class CategoriaService {
  
  async findAll() {
    try {
      return await prisma.categoria.findMany({
        include: {
          produto: {
            select: {
              id: true,
              nome: true,
              preco: true,
            }
          }
        },
        orderBy: {
          nome: 'asc'
        }
      });
    } catch (error) {
      throw new Error('Erro ao buscar categorias');
    }
  }

  async findById(id: number) {
    try {
      return await prisma.categoria.findUnique({
        where: { id },
        include: {
          produto: {
            select: {
              id: true,
              nome: true,
              preco: true,
              estoque: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error('Erro ao buscar categoria');
    }
  }

  async create(data: any) {
    try {
      const validatedData = createCategoriaSchema.parse(data);

      const existingCategoria = await prisma.categoria.findUnique({
        where: { nome: validatedData.nome }
      });

      if (existingCategoria) {
        throw new Error('Categoria com este nome já existe');
      }

      return await prisma.categoria.create({
        data: validatedData
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Dados inválidos: ${error.issues.map((e: any) => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  async update(id: number, data: any) {
    try {
      const validatedData = updateCategoriaSchema.parse(data);

      const categoria = await this.findById(id);
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }

      if (validatedData.nome && validatedData.nome !== categoria.nome) {
        const existingCategoria = await prisma.categoria.findUnique({
          where: { nome: validatedData.nome }
        });

        if (existingCategoria) {
          throw new Error('Categoria com este nome já existe');
        }
      }

      return await prisma.categoria.update({
        where: { id },
        data: validatedData
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Dados inválidos: ${error.issues.map((e: any) => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const categoria = await this.findById(id);
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }

      const produtosCount = await prisma.produto.count({
        where: { categoriaId: id }
      });

      if (produtosCount > 0) {
        throw new Error('Não é possível excluir categoria com produtos associados');
      }

      await prisma.categoria.delete({
        where: { id }
      });
    } catch (error) {
      throw error;
    }
  }

  async count() {
    try {
      return await prisma.categoria.count();
    } catch (error) {
      throw new Error('Erro ao contar categorias');
    }
  }
}