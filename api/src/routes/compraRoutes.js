import { Router } from 'express';
import {
  getCompras,
  getCompraPorId,
  crearCompra,
  actualizarCompra,
  eliminarCompra,
} from '../controllers/compraController.js';
import { verificarUsuario } from '../middleware/auth.js';

const router = Router();

// Las compras son privadas: solo un usuario logueado puede verlas o crearlas.
router.get('/', verificarUsuario, getCompras);
router.get('/:id', verificarUsuario, getCompraPorId);
router.post('/', verificarUsuario, crearCompra);
router.put('/:id', verificarUsuario, actualizarCompra);
router.delete('/:id', verificarUsuario, eliminarCompra);

export default router;
