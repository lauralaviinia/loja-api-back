import { Router } from 'express';
import { ClienteController } from '../controllers/clienteController';

const router = Router();
const clienteController = new ClienteController();

router.post('/login', clienteController.login);

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - cpf
 *         - senha
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do cliente
 *         nome:
 *           type: string
 *           description: Nome completo do cliente
 *           example: "João Silva"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do cliente
 *           example: "joao.silva@email.com"
 *         cpf:
 *           type: string
 *           description: CPF do cliente (apenas números)
 *           example: "12345678901"
 *         telefone:
 *           type: string
 *           description: Telefone do cliente
 *           example: "11999999999"
 *         senha:
 *           type: string
 *           description: Senha do cliente
 *           example: "Senha123"
 *         pedidos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Pedido'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ClienteInput:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - cpf
 *         - senha
 *       properties:
 *         nome:
 *           type: string
 *           example: "João Silva"
 *         email:
 *           type: string
 *           format: email
 *           example: "joao.silva@email.com"
 *         cpf:
 *           type: string
 *           example: "12345678901"
 *         telefone:
 *           type: string
 *           example: "11999999999"
 *         senha:
 *           type: string
 *           example: "Senha123"
 */

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Gerenciamento de clientes
 */

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Listar todos os clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes recuperada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', clienteController.getAll);

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Buscar cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente não encontrado
 *       400:
 *         description: ID inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', clienteController.getById);

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Criar um novo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteInput'
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email ou CPF já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', clienteController.create);

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Atualizar cliente existente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteInput'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Cliente não encontrado
 *       409:
 *         description: Email ou CPF já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', clienteController.update);

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     summary: Deletar cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente
 *     responses:
 *       204:
 *         description: Cliente deletado com sucesso
 *       400:
 *         description: ID inválido ou cliente possui pedidos
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', clienteController.delete);

export default router;