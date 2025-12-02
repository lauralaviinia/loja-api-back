import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

/* ============================================================
   SCHEMAS DE VALIDAÇÃO (Zod)
   ============================================================ */

// Validação de cada item do pedido
export const PedidoItemUpdateSchema = z.object({
  id: z.number().int().optional(),        // ID existe somente em itens já criados
  produtoId: z.number().int().positive(), // Produto obrigatório
  quantidade: z.number().int().positive().max(1000), // Quantidade permitida
});

// Validação da edição do pedido completo
export const PedidoUpdateSchema = z.object({
  status: z.enum([
    'PENDENTE',
    'PAGO',
    'PROCESSANDO',
    'ENVIADO',
    'ENTREGUE',
    'CANCELADO'
  ]).optional(),

  items: z.array(PedidoItemUpdateSchema).optional(),
});


/* ============================================================
   SERVICE PEDIDO
   ============================================================ */
export class PedidoService {


  /* ============================================================
     CRIAR
     ============================================================ */
  async create(data: {
    clienteId: number;
    data: string;
    items: { produtoId: number; quantidade: number }[];
  }) {

    return await prisma.$transaction(async (tx) => {

      /* ---------------------- Validar cliente ---------------------- */
      const cliente = await tx.cliente.findUnique({
        where: { id: data.clienteId }
      });

      if (!cliente) throw new Error("Cliente não encontrado");


      /* ---------------------- Validar estoque ---------------------- */
      for (const item of data.items) {
        const produto = await tx.produto.findUnique({
          where: { id: item.produtoId }
        });

        if (!produto) throw new Error("Produto não encontrado");
        
        if (produto.estoque < item.quantidade) {
          throw new Error(
            `Estoque insuficiente para o produto ${produto.nome}. ` +
            `Disponível: ${produto.estoque} unidades | ` +
            `Solicitado: ${item.quantidade} unidades`
          );
        }
      }


      /* ---------------------- Criar pedido ---------------------- */
      const pedido = await tx.pedido.create({
        data: {
          clienteId: data.clienteId,
          data: new Date(data.data),
          status: "PENDENTE"
        }
      });


      /* ---------------------- Criar itens do pedido ---------------------- */
      for (const item of data.items) {

        // Cria item
        await tx.pedidoItem.create({
          data: {
            pedidoId: pedido.id,
            produtoId: item.produtoId,
            quantidade: item.quantidade
          }
        });

        // Atualiza estoque
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { decrement: item.quantidade } }
        });
      }


      /* ---------------------- Calcular total ---------------------- */
      const itens = await tx.pedidoItem.findMany({
        where: { pedidoId: pedido.id },
        include: { produto: true }
      });

      const total = itens.reduce(
        (soma, item) => soma + item.produto.preco * item.quantidade,
        0
      );

      await tx.pedido.update({
        where: { id: pedido.id },
        data: { total }
      });


      /* ---------------------- Retornar pedido completo ---------------------- */
      return await tx.pedido.findUnique({
        where: { id: pedido.id },
        include: {
          cliente: true,
          items: { include: { produto: true } }
        }
      });
    });
  }



  /* ============================================================
     Buscar pedidos com filtros (clienteId, status)
     ============================================================ */
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
            produto: {
              include: { categoria: { select: { id: true, nome: true } } }
            }
          }
        }
      },
      orderBy: { data: 'desc' }
    });
  }



  /* ============================================================
     Buscar pedido por ID
     ============================================================ */
  async findById(id: number) {
    return await prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: { select: { id: true, nome: true, email: true, telefone: true } },
        items: {
          include: {
            produto: {
              include: {
                categoria: { select: { id: true, nome: true } }
              }
            }
          }
        }
      }
    });
  }



  /* ============================================================
     ATUALIZAR
     ============================================================ */
  async update(id: number, data: z.infer<typeof PedidoUpdateSchema>) {

    const pedido = await this.findById(id);
    if (!pedido) throw new Error("Pedido não encontrado");

    const validated = PedidoUpdateSchema.parse(data);

    return await prisma.$transaction(async (tx) => {

      /* ---------------------- Atualizar Status ---------------------- */
      if (validated.status !== undefined) {
        await tx.pedido.update({
          where: { id },
          data: { status: validated.status },
        });
      }


      /* ---------------------- Atualizar Itens ---------------------- */
      if (validated.items) {

        const itensAtuais = pedido.items;

        // Remove itens que sumiram no update
        const idsEnviados = validated.items.filter(i => i.id).map(i => i.id);
        const idsAtuais = itensAtuais.map(i => i.id);

        const idsParaRemover = idsAtuais.filter(idItem => !idsEnviados.includes(idItem));

        for (const removeId of idsParaRemover) {
          const item = itensAtuais.find(i => i.id === removeId);

          if (item) {
            // Devolver estoque
            await tx.produto.update({
              where: { id: item.produtoId },
              data: { estoque: { increment: item.quantidade } }
            });

            await tx.pedidoItem.delete({ where: { id: removeId } });
          }
        }


        // Criar ou atualizar itens
        for (const item of validated.items) {
          const existente = itensAtuais.find(i => i.id === item.id);

          if (!existente) {
            /* ----- Criar novo item ----- */
            const produto = await tx.produto.findUnique({ where: { id: item.produtoId } });
            if (!produto) throw new Error("Produto não encontrado");
            if (produto.estoque < item.quantidade) throw new Error("Estoque insuficiente");

            await tx.pedidoItem.create({
              data: {
                pedidoId: id,
                produtoId: item.produtoId,
                quantidade: item.quantidade
              }
            });

            await tx.produto.update({
              where: { id: item.produtoId },
              data: { estoque: { decrement: item.quantidade } }
            });

          } else {
            /* ----- Atualizar item existente ----- */
            const diff = item.quantidade - existente.quantidade;

            const produto = await tx.produto.findUnique({ where: { id: existente.produtoId } });
            if (!produto) throw new Error("Produto não encontrado");

            if (diff > 0 && produto.estoque < diff)
              throw new Error("Estoque insuficiente");

            await tx.pedidoItem.update({
              where: { id: existente.id },
              data: { quantidade: item.quantidade }
            });

            await tx.produto.update({
              where: { id: existente.produtoId },
              data: { estoque: { decrement: diff } }
            });
          }
        }


        /* ---------------------- Recalcular Total ---------------------- */
        const novosItens = await tx.pedidoItem.findMany({
          where: { pedidoId: id },
          include: { produto: true }
        });

        const total = novosItens.reduce(
          (soma, item) => soma + item.produto.preco * item.quantidade,
          0
        );

        await tx.pedido.update({
          where: { id },
          data: { total }
        });
      }


      /* ---------------------- Retornar pedido atualizado ---------------------- */
      return await tx.pedido.findUnique({
        where: { id },
        include: {
          cliente: true,
          items: { include: { produto: true } }
        }
      });
    });
  }



  /* ============================================================
     DELETAR
     ============================================================ */
  async delete(id: number) {

    const pedido = await this.findById(id);
    if (!pedido) throw new Error('Pedido não encontrado');

    if (pedido.status !== 'PENDENTE')
      throw new Error('Só é possível excluir pedidos PENDENTES');

    return await prisma.$transaction(async (tx) => {

      // Devolver estoque dos itens
      for (const item of pedido.items) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { increment: item.quantidade } }
        });
      }

      // Remover itens do pedido antes de apagar o pedido (evita FK constraint)
      await tx.pedidoItem.deleteMany({ where: { pedidoId: id } });

      // Excluir pedido
      return await tx.pedido.delete({ where: { id } });
    });
  }
}