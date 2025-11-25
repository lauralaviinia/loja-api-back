import { Request, Response } from 'express';
import { ProdutoService } from '../services/produtoService';
import { ZodError } from 'zod';
import { getProductsQuerySchema } from '../schemas/validation'; // Import do schema de filtro

const produtoService = new ProdutoService();

export class ProdutoController {
  async getAll(req: Request, res: Response) {
    try {
      const { categoriaId } = getProductsQuerySchema.parse(req.query);
      const filters = {
        ...(categoriaId && { categoriaId: Number(categoriaId) }),
      };

      const produtos = await produtoService.findAll(filters);
      res.json(produtos);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Parâmetro de filtro inválido',
          details: error.flatten().fieldErrors,
        });
      }
      res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const produto = await produtoService.findById(parseInt(id));

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(produto);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const produto = await produtoService.create(req.body);
      res.status(201).json(produto);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.issues,
        });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const produto = await produtoService.update(parseInt(id), req.body);
      res.json(produto);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.issues,
        });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await produtoService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  }
}
