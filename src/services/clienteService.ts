import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { createClienteSchema, updateClienteSchema } from '../schemas/validation';

const prisma = new PrismaClient();

/* ============================================================
   Converte data no formato dd/mm/yyyy ou ISO
   ============================================================ */
function converterData(data?: string | null): Date | null {
  if (!data || data === "") return null;

  if (data.includes("/")) {
    const [dia, mes, ano] = data.split("/");
    return new Date(`${ano}-${mes}-${dia}T00:00:00`);
  }

  const parsed = new Date(data);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/* ============================================================
   SERVICE DO CLIENTE
   ============================================================ */
export class ClienteService {

  /* ============================================================
     BUSCAR TODOS
   ============================================================ */
  async findAll() {
    return prisma.cliente.findMany({
      include: {
        pedidos: {
          select: {
            id: true,
            data: true,
            total: true,
            status: true,
          },
          orderBy: { data: 'desc' },
          take: 5,
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  /* ============================================================
     BUSCAR POR ID
   ============================================================ */
  async findById(id: number) {
    return prisma.cliente.findUnique({
      where: { id },
      include: {
        pedidos: {
          include: {
            items: {
              include: {
                produto: {
                  include: { categoria: true },
                },
              },
            },
          },
          orderBy: { data: 'desc' },
        },
      },
    });
  }

  /* ============================================================
     CRIAR CLIENTE
   ============================================================ */
  async create(data: any) {
    const validatedData = createClienteSchema.parse(data);

    // valida email
    const existingEmail = await prisma.cliente.findUnique({
      where: { email: validatedData.email },
    });
    if (existingEmail) throw new Error("Email já cadastrado");

    // valida cpf
    const existingCpf = await prisma.cliente.findUnique({
      where: { cpf: validatedData.cpf },
    });
    if (existingCpf) throw new Error("CPF já cadastrado");

    const hashedPassword = await bcrypt.hash(validatedData.senha, 10);

    return prisma.cliente.create({
      data: {
        nome: validatedData.nome,
        email: validatedData.email,
        cpf: validatedData.cpf,
        telefone: validatedData.telefone ?? null,
        senha: hashedPassword,
        dataNascimento: converterData(validatedData.dataNascimento)
      },
    });
  }

  /* ============================================================
     ATUALIZAR CLIENTE  
   ============================================================ */
  async update(id: number, data: any) {
    const validatedData = updateClienteSchema.parse(data);

    const clienteAtual = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteAtual) throw new Error("Cliente não encontrado");

    const updatedData: any = {};

    // valida nome
    if (validatedData.nome !== undefined) {
      updatedData.nome = validatedData.nome;
    }

    // valida email
    if (validatedData.email && validatedData.email !== clienteAtual.email) {
      const existingEmail = await prisma.cliente.findUnique({
        where: { email: validatedData.email }
      });
      if (existingEmail) throw new Error("Email já cadastrado");
      updatedData.email = validatedData.email;
    }

    // valida cpf
    if (validatedData.cpf && validatedData.cpf !== clienteAtual.cpf) {
      const existingCpf = await prisma.cliente.findUnique({
        where: { cpf: validatedData.cpf }
      });
      if (existingCpf) throw new Error("CPF já cadastrado");
      updatedData.cpf = validatedData.cpf;
    }

    // valida telefone
    if (validatedData.telefone !== undefined) {
      updatedData.telefone =
        validatedData.telefone === "" ? null : validatedData.telefone;
    }

    // valida data de nascimento
    if (validatedData.dataNascimento !== undefined) {
      updatedData.dataNascimento =
        validatedData.dataNascimento === ""
          ? null
          : converterData(validatedData.dataNascimento);
    }

    // valida senha e só atualiza se enviada e não for vazia 
    if (validatedData.senha) {
      updatedData.senha = await bcrypt.hash(validatedData.senha, 10);
    }

    return prisma.cliente.update({
      where: { id },
      data: updatedData,
    });
  }

  /* ============================================================
     DELETAR
   ============================================================ */
  async delete(id: number) {
    const cliente = await this.findById(id);
    if (!cliente) throw new Error("Cliente não encontrado");

    const pedidosCount = await prisma.pedido.count({
      where: { clienteId: id }
    });

    if (pedidosCount > 0)
      throw new Error("Não é possível excluir cliente com pedidos associados");

    return prisma.cliente.delete({ where: { id } });
  }

  /* ============================================================
     LOGIN
   ============================================================ */
  async login(email: string, senha: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { email }
    });

    if (!cliente) return null;

    const senhaValida = await bcrypt.compare(senha, cliente.senha);
    if (!senhaValida) return null;

    return cliente;
  }
}
