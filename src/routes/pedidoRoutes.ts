import { Router } from 'express';
import { PedidoController } from '../controllers/pedidoController';

const router = Router();
const pedidoController = new PedidoController();

/**
 * @swagger
 * components:
 *   schemas:
 *     PedidoItemInput:
 *       type: object
 *       required:
 *         - produtoId
 *         - quantidade
 *       properties:
 *         produtoId:
 *           type: integer
 *           description: ID do produto
 *           example: 1
 *         quantidade:
 *           type: integer
 *           description: Quantidade do produto
 *           example: 2
 *     Pedido:
 *       type: object
 *       required:
 *         - clienteId
 *         - data
 *         - items
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do pedido
 *         clienteId:
 *           type: integer
 *           description: ID do cliente
 *         data:
 *           type: string
 *           format: date-time
 *           description: Data do pedido
 *         total:
 *           type: number
 *           format: float
 *           description: Total do pedido
 *         status:
 *           type: string
 *           description: Status do pedido
 *           enum: [PENDENTE, PROCESSANDO, ENVIADO, ENTREGUE, CANCELADO]
 *         cliente:
 *           $ref: '#/components/schemas/Cliente'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PedidoItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PedidoItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         pedidoId:
 *           type: integer
 *         produtoId:
 *           type: integer
 *         quantidade:
 *           type: integer
 *         produto:
 *           $ref: '#/components/schemas/Produto'
 *         createdAt:
 *           type: string
 *           format: date-time
 *     PedidoInput:
 *       type: object
 *       required:
 *         - clienteId
 *         - data
 *         - items
 *       properties:
 *         clienteId:
 *           type: integer
 *           example: 1
 *         data:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PedidoItemInput'
 *     PedidoUpdate:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDENTE, PROCESSANDO, ENVIADO, ENTREGUE, CANCELADO]
 *           example: "PROCESSANDO"
 */

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Gerenciamento de pedidos
 */

/**
 * @swagger
 * /pedidos:
 *   get:
 *     summary: Listar todos os pedidos
 *     tags: [Pedidos]
 *     parameters:
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: integer
 *         description: Filtrar pedidos por cliente
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar pedidos por status
 *     responses:
 *       200:
 *         description: Lista de pedidos recuperada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', pedidoController.getAll);

/**
 * @swagger
 * /pedidos/{id}:
 *   get:
 *     summary: Buscar pedido por ID
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       404:
 *         description: Pedido não encontrado
 *       400:
 *         description: ID inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', pedidoController.getById);

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: Criar um novo pedido
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoInput'
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       400:
 *         description: Dados inválidos ou estoque insuficiente
 *       404:
 *         description: Cliente ou produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', pedidoController.create);

/**
 * @swagger
 * /pedidos/{id}:
 *   put:
 *     summary: Atualizar status do pedido
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoUpdate'
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', pedidoController.update);

/**
 * @swagger
 * /pedidos/{id}:
 *   delete:
 *     summary: Cancelar pedido
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido cancelado com sucesso
 *       400:
 *         description: ID inválido ou pedido não pode ser cancelado
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', pedidoController.delete);

export default router;