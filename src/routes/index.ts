import { Router } from "express";

import produtoRoutes from "./produtoRoutes";
import categoriaRoutes from "./categoriaRoutes";
import clienteRoutes from "./clienteRoutes";
import pedidoRoutes from "./pedidoRoutes";

const router = Router();

router.use("/produtos", produtoRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/clientes", clienteRoutes);
router.use("/pedidos", pedidoRoutes);

export default router;
