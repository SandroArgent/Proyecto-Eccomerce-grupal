import { Router } from 'express';
import {
  getDomicilios,
  getDomicilioPorId,
  crearDomicilio,
  actualizarDomicilio,
  eliminarDomicilio,
} from '../controllers/domicilioController.js';
import { verificarUsuario } from '../middleware/auth.js';

const router = Router();

// Los domicilios son datos privados del usuario: todo requiere sesión.
router.get('/', verificarUsuario, getDomicilios);
router.get('/:id', verificarUsuario, getDomicilioPorId);
router.post('/', verificarUsuario, crearDomicilio);
router.put('/:id', verificarUsuario, actualizarDomicilio);
router.delete('/:id', verificarUsuario, eliminarDomicilio);

export default router;
