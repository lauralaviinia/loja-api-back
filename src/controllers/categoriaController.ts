import { Request, Response } from 'express';
import { CategoriaService } from '../services/categoriaService';
import { ZodError } from 'zod';

const categoriaService = new CategoriaService();

export class CategoriaController {
  async getAll(req: Request, res: Response) {
    try {
      const categorias = await categoriaService.findAll();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.findById(parseInt(id));

      if (!categoria) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json(categoria);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar categoria' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const categoria = await categoriaService.create(req.body);
      res.status(201).json(categoria);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.issues 
        });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.update(parseInt(id), req.body);
      res.json(categoria);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.issues 
        });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await categoriaService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao deletar categoria' });
    }
  }
}