import { Request, Response } from 'express';
import { ClienteService } from '../services/clienteService';
import { ZodError } from 'zod';

const clienteService = new ClienteService();

export class ClienteController {

  /* ============================================================
     BUSCAR TODOS OS CLIENTES
     ============================================================ */

  async getAll(req: Request, res: Response) {
    try {
      const clientes = await clienteService.findAll();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
  }

  async getById(req: Request, res: Response) {

    /* ============================================================
       BUSCAR CLIENTE POR ID
       ============================================================ */

    try {
      const { id } = req.params;
      const cliente = await clienteService.findById(parseInt(id));

      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json(cliente);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
  }

  /* ============================================================
     CRIAR NOVO CLIENTE
     ============================================================ */

  async create(req: Request, res: Response) {
    try {
      const cliente = await clienteService.create(req.body);
      res.status(201).json(cliente);
    } catch (error) {

      // Tratamento de erros de validação do Zod
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.issues
        });
      }

      // Erro throw manual
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }

      // Erro inesperado
      res.status(500).json({ error: 'Erro ao criar cliente' });
    }
  }

  /* ============================================================
     ATUALIZAR CLIENTE
     ============================================================ */

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cliente = await clienteService.update(parseInt(id), req.body);
      res.json(cliente);
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
      res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
  }

  /* ============================================================
     DELETAR CLIENTE
     ============================================================ */

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await clienteService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
  }

  /* ============================================================
     LOGIN DO CLIENTE
     ============================================================ */

  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      // Chama a regra de negócio no service
      const cliente = await clienteService.login(email, senha);

      // Se não encontrar ou senha inválida -> 401
      if (!cliente) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Remove a senha do objeto retornado
      const { senha: _senha, ...clienteSeguro } = cliente as any;

      res.json(clienteSeguro);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }
}
