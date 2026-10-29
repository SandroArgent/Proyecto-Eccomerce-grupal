import { Router } from 'express';
import {
  getProductoPorCarritos,
  getProductoPorCarritoPorId,
  crearProductoPorCarrito,
  actualizarProductoPorCarrito,
  eliminarProductoPorCarrito,
} from '../controllers/productoPorCarritoController.js';
import { verificarUsuario } from '../middleware/auth.js';

const router = Router();

// Ítems dentro de un carrito: requiere sesión del usuario dueño del carrito.
router.get('/', verificarUsuario, getProductoPorCarritos);
router.get('/:id', verificarUsuario, getProductoPorCarritoPorId);
router.post('/', verificarUsuario, crearProductoPorCarrito);
router.put('/:id', verificarUsuario, actualizarProductoPorCarrito);
router.delete('/:id', verificarUsuario, eliminarProductoPorCarrito);

export default router;
