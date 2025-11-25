import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Schemas de validação
import { createClienteSchema, updateClienteSchema } from '../schemas/validation';

const prisma = new PrismaClient();

/* ============================================================
   SERVICE DO CLIENTE (Regras de Negócio)
   ============================================================ */
export class ClienteService {

  /* ============================================================
     BUSCAR TODOS OS CLIENTES
     - Inclui últimos 5 pedidos de cada cliente
     ============================================================ */
  async findAll() {
    try {
      return await prisma.cliente.findMany({
        include: {
          pedidos: {
            select: {
              id: true,
              data: true,
              total: true,
              status: true
            },
            orderBy: { data: 'desc' },
            take: 5
          }
        },
        orderBy: { nome: 'asc' }
      });
    } catch {
      throw new Error('Erro ao buscar clientes');
    }
  }

  /* ============================================================
     BUSCAR CLIENTE POR ID
     - Traz pedidos, itens e produtos relacionados
     ============================================================ */
  async findById(id: number) {
    try {
      return await prisma.cliente.findUnique({
        where: { id },
        include: {
          pedidos: {
            include: {
              items: {
                include: {
                  produto: {
                    include: { categoria: true }
                  }
                }
              }
            },
            orderBy: { data: 'desc' }
          }
        }
      });
    } catch {
      throw new Error('Erro ao buscar cliente');
    }
  }

  /* ============================================================
     CRIAR CLIENTE
     - Valida dados com createClienteSchema
     - Impede duplicação de email e CPF
     - Hash da senha
     ============================================================ */
  async create(data: any) {
    try {
      // Validação com schema central
      const validatedData = createClienteSchema.parse(data);

      // Verifica email duplicado
      const existingEmail = await prisma.cliente.findUnique({ where: { email: validatedData.email } });
      if (existingEmail) throw new Error('Email já cadastrado');

      // Verifica CPF duplicado
      const existingCpf = await prisma.cliente.findUnique({ where: { cpf: validatedData.cpf } });
      if (existingCpf) throw new Error('CPF já cadastrado');

      // Hash da senha
      const hashedPassword = await bcrypt.hash(validatedData.senha, 10);

      // Cria o cliente no banco; converte dataNascimento para Date ou null
      return await prisma.cliente.create({
        data: {
          nome: validatedData.nome,
          email: validatedData.email,
          cpf: validatedData.cpf,
          telefone: validatedData.telefone ?? null,
          senha: hashedPassword,
          dataNascimento: validatedData.dataNascimento
            ? new Date(validatedData.dataNascimento)
            : null
        }
      });
    } catch (error) {
      // ZodError -> mensagem legível
      if (error instanceof z.ZodError) {
        throw new Error(`Dados inválidos: ${error.issues.map((e) => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /* ============================================================
     ATUALIZAR CLIENTE
     - Valida com updateClienteSchema
     - Evita duplicidade de email/cpf
     - Hashea senha se fornecida
     ============================================================ */
  async update(id: number, data: any) {
  try {
    const validatedData = updateClienteSchema.parse(data);

    const cliente = await this.findById(id);
    if (!cliente) throw new Error('Cliente não encontrado');

    // Evita email duplicado
    if (validatedData.email && validatedData.email !== cliente.email) {
      const existingEmail = await prisma.cliente.findUnique({
        where: { email: validatedData.email }
      });
      if (existingEmail) throw new Error('Email já cadastrado');
    }

    // Evita CPF duplicado
    if (validatedData.cpf && validatedData.cpf !== cliente.cpf) {
      const existingCpf = await prisma.cliente.findUnique({
        where: { cpf: validatedData.cpf }
      });
      if (existingCpf) throw new Error('CPF já cadastrado');
    }

    const updatedData: any = { ...validatedData };

    // ------------------------------
    // SENHA 
    // ------------------------------
    if (validatedData.senha) {
      updatedData.senha = await bcrypt.hash(validatedData.senha, 10);
    } else {
      delete updatedData.senha;
    }

    // ------------------------------
    // DATA DE NASCIMENTO
    // ------------------------------
    if (validatedData.dataNascimento) {
      updatedData.dataNascimento = new Date(validatedData.dataNascimento);
    } else {
      delete updatedData.dataNascimento;
    }

    return await prisma.cliente.update({
      where: { id },
      data: updatedData
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Dados inválidos: ${error.issues.map((e) => e.message).join(', ')}`
      );
    }
    throw error;
  }
}
 
  /* ============================================================
     DELETAR CLIENTE
     - Não permite excluir com pedidos associados
     ============================================================ */
  async delete(id: number) {
    try {
      const cliente = await this.findById(id);
      if (!cliente) throw new Error('Cliente não encontrado');

      const pedidosCount = await prisma.pedido.count({ where: { clienteId: id } });
      if (pedidosCount > 0) throw new Error('Não é possível excluir cliente com pedidos associados');

      await prisma.cliente.delete({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  /* ============================================================
     BUSCAR POR EMAIL
     ============================================================ */
  async findByEmail(email: string) {
    try {
      return await prisma.cliente.findUnique({
        where: { email },
        include: {
          pedidos: {
            include: {
              items: { include: { produto: true } }
            }
          }
        }
      });
    } catch {
      throw new Error('Erro ao buscar cliente por email');
    }
  }

  /* ============================================================
     CONTAR CLIENTES
     ============================================================ */
  async count() {
    try {
      return await prisma.cliente.count();
    } catch {
      throw new Error('Erro ao contar clientes');
    }
  }

  /* ============================================================
     LOGIN DO CLIENTE
     - Busca por email e compara senha via bcrypt.compare
     - Retorna cliente (com senha) para que o controller remova a senha antes de enviar
     ============================================================ */
  async login(email: string, senha: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { email }
    });
    if (!cliente) return null;
    if (!cliente.senha) return null;

    const senhaValida = await bcrypt.compare(senha, cliente.senha);
    if (!senhaValida) return null;

    return cliente;
  }
}
