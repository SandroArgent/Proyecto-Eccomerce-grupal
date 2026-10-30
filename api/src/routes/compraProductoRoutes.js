import { Router } from 'express';
import {
  getCompraProductos,
  getCompraProductoPorId,
  crearCompraProducto,
  actualizarCompraProducto,
  eliminarCompraProducto,
} from '../controllers/compraProductoController.js';
import { verificarUsuario } from '../middleware/auth.js';

const router = Router();

// Detalle de una compra: requiere sesión del usuario dueño de la compra.
router.get('/', verificarUsuario, getCompraProductos);
router.get('/:id', verificarUsuario, getCompraProductoPorId);
router.post('/', verificarUsuario, crearCompraProducto);
router.put('/:id', verificarUsuario, actualizarCompraProducto);
router.delete('/:id', verificarUsuario, eliminarCompraProducto);

export default router;
