import { Router } from 'express';
import {
  getUsuarios,
  getUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../controllers/usuarioController.js';
import { verificarAdmin } from '../middleware/auth.js';

const router = Router();

// El alta "real" de usuarios pasa por /api/auth/usuario/registro (hashea
// la contraseña, valida el email y crea el carrito 1:1). Este CRUD directo
// queda reservado para que un administrador gestione usuarios ya existentes.
router.get('/', verificarAdmin, getUsuarios);
router.get('/:id', verificarAdmin, getUsuarioPorId);
router.post('/', verificarAdmin, crearUsuario);
router.put('/:id', verificarAdmin, actualizarUsuario);
router.delete('/:id', verificarAdmin, eliminarUsuario);

export default router;
