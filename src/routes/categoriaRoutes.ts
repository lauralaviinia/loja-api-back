import { Router } from 'express';
import { CategoriaController } from '../controllers/categoriaController';

const router = Router();
const categoriaController = new CategoriaController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado da categoria
 *         nome:
 *           type: string
 *           description: Nome da categoria
 *           example: "Eletrônicos"
 *         descricao:
 *           type: string
 *           description: Descrição da categoria
 *           example: "Produtos eletrônicos em geral"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CategoriaInput:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         nome:
 *           type: string
 *           example: "Eletrônicos"
 *         descricao:
 *           type: string
 *           example: "Produtos eletrônicos em geral"
 */

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Gerenciamento de categorias de produtos
 */

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Listar todas as categorias
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorias recuperada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', categoriaController.getAll);

/**
 * @swagger
 * /categorias/{id}:
 *   get:
 *     summary: Buscar categoria por ID
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       404:
 *         description: Categoria não encontrada
 *       400:
 *         description: ID inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', categoriaController.getById);

/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Criar uma nova categoria
 *     tags: [Categorias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaInput'
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Categoria já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', categoriaController.create);

/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     summary: Atualizar categoria existente
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaInput'
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', categoriaController.update);

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: Deletar categoria
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     responses:
 *       204:
 *         description: Categoria deletada com sucesso
 *       400:
 *         description: ID inválido ou categoria possui produtos
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', categoriaController.delete);

export default router;