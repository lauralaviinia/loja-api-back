import { Request, Response } from 'express';
import { PedidoService } from '../services/pedidoService';
import { createPedidoSchema } from '../schemas/validation';
import { ZodError } from 'zod';

const pedidoService = new PedidoService();

export class PedidoController {

  /* ============================================================
     LISTAR TODOS
  ============================================================ */
  async getAll(req: Request, res: Response) {
    try {
      const clienteId = req.query.clienteId
        ? Number(req.query.clienteId)
        : undefined;

      if (req.query.clienteId && isNaN(clienteId!)) {
        return res.status(400).json({ error: "clienteId precisa ser numérico" });
      }

      const status = req.query.status as string | undefined;

      const pedidos = await pedidoService.findAll({ clienteId, status });
      res.json(pedidos);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
  }


  /* ============================================================
     BUSCAR POR ID
  ============================================================ */
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const pedido = await pedidoService.findById(id);

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      res.json(pedido);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pedido' });
    }
  }


  /* ============================================================
     CRIAR
  ============================================================ */
  async create(req: Request, res: Response) {
    try {

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Body da requisição está vazio" });
      }

      // Validar schema do pedido com Zod
      const validatedData = createPedidoSchema.parse(req.body);

      const pedido = await pedidoService.create(validatedData);
      res.status(201).json(pedido);

    } catch (error) {

      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.issues.map(issue => ({
            campo: issue.path.join('.'),
            mensagem: issue.message
          }))
        });
      }

      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }

      console.error(error);
      res.status(500).json({ error: 'Erro ao criar pedido' });
    }
  }


  /* ============================================================
     ATUALIZAR
  ============================================================ */
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const pedido = await pedidoService.update(id, req.body);
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


  /* ============================================================
     DELETAR
  ============================================================ */
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      await pedidoService.delete(id);
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