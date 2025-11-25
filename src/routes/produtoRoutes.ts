import { Router } from 'express';
import { ProdutoController } from '../controllers/produtoController';

const router = Router();
const produtoController = new ProdutoController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Produto:
 *       type: object
 *       required:
 *         - nome
 *         - preco
 *         - estoque
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do produto
 *         nome:
 *           type: string
 *           description: Nome do produto
 *           example: "Smartphone Samsung"
 *         descricao:
 *           type: string
 *           description: Descrição do produto
 *           example: "Smartphone Samsung Galaxy S23"
 *         preco:
 *           type: number
 *           format: float
 *           description: Preço do produto
 *           example: 1999.99
 *         estoque:
 *           type: integer
 *           description: Quantidade em estoque
 *           example: 50
 *         categoriaId:
 *           type: integer
 *           description: ID da categoria do produto
 *           example: 1
 *         categoria:
 *           $ref: '#/components/schemas/Categoria'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProdutoInput:
 *       type: object
 *       required:
 *         - nome
 *         - preco
 *         - estoque
 *       properties:
 *         nome:
 *           type: string
 *           example: "Smartphone Samsung"
 *         descricao:
 *           type: string
 *           example: "Smartphone Samsung Galaxy S23"
 *         preco:
 *           type: number
 *           format: float
 *           example: 1999.99
 *         estoque:
 *           type: integer
 *           example: 50
 *         categoriaId:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * tags:
 *   name: Produtos
 *   description: Gerenciamento de produtos
 */

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Listar todos os produtos
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *         description: Filtrar produtos por categoria
 *     responses:
 *       200:
 *         description: Lista de produtos recuperada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', produtoController.getAll);

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Buscar produto por ID
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       404:
 *         description: Produto não encontrado
 *       400:
 *         description: ID inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', produtoController.getById);

/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Criar um novo produto
 *     tags: [Produtos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProdutoInput'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', produtoController.create);

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     summary: Atualizar produto existente
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProdutoInput'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', produtoController.update);

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     summary: Deletar produto
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       204:
 *         description: Produto deletado com sucesso
 *       400:
 *         description: ID inválido ou produto possui pedidos
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', produtoController.delete);

export default router;