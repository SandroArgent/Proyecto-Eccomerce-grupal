import { Router } from 'express';
import {
  getCarritos,
  getCarritoPorId,
  crearCarrito,
  actualizarCarrito,
  eliminarCarrito,
} from '../controllers/carritoController.js';
import { verificarUsuario } from '../middleware/auth.js';

const router = Router();

// El carrito es información privada del usuario: todo requiere sesión.
router.get('/', verificarUsuario, getCarritos);
router.get('/:id', verificarUsuario, getCarritoPorId);
router.post('/', verificarUsuario, crearCarrito);
router.put('/:id', verificarUsuario, actualizarCarrito);
router.delete('/:id', verificarUsuario, eliminarCarrito);

export default router;
