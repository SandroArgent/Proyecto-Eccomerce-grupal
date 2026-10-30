import { Router } from 'express';
import {
  getTelefonos,
  getTelefonoPorId,
  crearTelefono,
  actualizarTelefono,
  eliminarTelefono,
} from '../controllers/telefonoController.js';
import { verificarUsuario } from '../middleware/auth.js';

const router = Router();

// Los teléfonos pertenecen a un usuario: todo requiere sesión.
router.get('/', verificarUsuario, getTelefonos);
router.get('/:id', verificarUsuario, getTelefonoPorId);
router.post('/', verificarUsuario, crearTelefono);
router.put('/:id', verificarUsuario, actualizarTelefono);
router.delete('/:id', verificarUsuario, eliminarTelefono);

export default router;
