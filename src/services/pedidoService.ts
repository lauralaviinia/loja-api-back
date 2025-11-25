import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const PedidoItemCreateSchema = z.object({
  produtoId: z.number().int().positive('Produto ID inválido'),
  quantidade: z.number().int().positive('Quantidade deve ser positiva').max(1000, 'Quantidade muito alta'),
});

export const PedidoCreateSchema = z.object({
  clienteId: z.number().int().positive('Cliente ID inválido'),
  data: z.string().datetime('Data inválida'),
  items: z.array(PedidoItemCreateSchema).min(1, 'Pedido deve ter pelo menos um item'),
});

export const PedidoUpdateSchema = z.object({
  status: z.enum(['PENDENTE', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO']),
});

export class PedidoService {

  async findAll(filtros?: { clienteId?: number; status?: string }) {
    const where: any = {};
    if (filtros?.clienteId) where.clienteId = filtros.clienteId;
    if (filtros?.status) where.status = filtros.status;

    return await prisma.pedido.findMany({
      where,
      include: {
        cliente: { select: { id: true, nome: true, email: true } },
        items: {
          include: {
            produto: { include: { categoria: { select: { id: true, nome: true } } } }
          }
        }
      },
      orderBy: { data: 'desc' }
    });
  }

  async findById(id: number) {
    return await prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: { select: { id: true, nome: true, email: true, telefone: true } },
        items: {
          include: {
            produto: { include: { categoria: { select: { id: true, nome: true } } } }
          }
        }
      }
    });
  }

  async create(data: z.infer<typeof PedidoCreateSchema>) {
    const validatedData = PedidoCreateSchema.parse(data);

    const cliente = await prisma.cliente.findUnique({ where: { id: validatedData.clienteId } });
    if (!cliente) throw new Error('Cliente não encontrado');

    let total = 0;
    const itemsComPreco: Array<{ produtoId: number; quantidade: number }> = [];

    for (const item of validatedData.items) {
      const produto = await prisma.produto.findUnique({ where: { id: item.produtoId } });
      if (!produto) throw new Error(`Produto com ID ${item.produtoId} não encontrado`);
      if (produto.estoque < item.quantidade)
        throw new Error(`Estoque insuficiente para o produto ${produto.nome}. Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}`);

      total += produto.preco * item.quantidade;
      itemsComPreco.push({ produtoId: item.produtoId, quantidade: item.quantidade });
    }

    return await prisma.$transaction(async (tx) => {
      const novoPedido = await tx.pedido.create({
        data: {
          clienteId: validatedData.clienteId,
          data: new Date(validatedData.data),
          total,
          items: { create: itemsComPreco }
        },
        include: {
          cliente: { select: { id: true, nome: true, email: true } },
          items: { include: { produto: { include: { categoria: { select: { id: true, nome: true } } } } } }
        }
      });

      for (const item of validatedData.items) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { decrement: item.quantidade } }
        });
      }

      return novoPedido;
    });
  }

  async update(id: number, data: z.infer<typeof PedidoUpdateSchema>) {
    const validatedData = PedidoUpdateSchema.parse(data);
    const pedido = await this.findById(id);
    if (!pedido) throw new Error('Pedido não encontrado');

    return await prisma.pedido.update({
      where: { id },
      data: validatedData,
      include: {
        cliente: { select: { id: true, nome: true, email: true } },
        items: { include: { produto: { include: { categoria: { select: { id: true, nome: true } } } } } }
      }
    });
  }

  async delete(id: number): Promise<void> {
    const pedido = await this.findById(id);
    if (!pedido) throw new Error('Pedido não encontrado');
    if (pedido.status !== 'PENDENTE') throw new Error('Só é possível excluir pedidos com status PENDENTE');

    await prisma.$transaction(async (tx) => {
      for (const item of pedido.items) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { increment: item.quantidade } }
        });
      }
      await tx.pedido.delete({ where: { id } });
    });
  }

  async findByCliente(clienteId: number) {
    return this.findAll({ clienteId });
  }

  async findByStatus(status: string) {
    return this.findAll({ status });
  }
}