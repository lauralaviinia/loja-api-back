import { Request, Response } from 'express';
import { PedidoService } from '../services/pedidoService';
import { ZodError } from 'zod';

const pedidoService = new PedidoService();

export class PedidoController {
  async getAll(req: Request, res: Response) {
    try {
      const clienteId = req.query.clienteId ? Number(req.query.clienteId) : undefined;
      const status = req.query.status as string | undefined;

      const pedidos = await pedidoService.findAll({ clienteId, status });
      res.json(pedidos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pedido = await pedidoService.findById(parseInt(id));

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      res.json(pedido);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pedido' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const pedido = await pedidoService.create(req.body);
      res.status(201).json(pedido);
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
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar pedido' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pedido = await pedidoService.update(parseInt(id), req.body);
      res.json(pedido);
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
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await pedidoService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      res.status(500).json({ error: 'Erro ao deletar pedido' });
    }
  }
}
