import { Router } from 'express';
import {
  loginUsuario,
  registrarUsuario,
  perfilUsuario,
  loginAdmin,
} from '../controllers/authController.js';
import { verificarUsuario } from '../middleware/auth.js';

const router = Router();

// Rutas públicas de usuario (cualquiera puede llamarlas sin token).
router.post('/usuario/login', loginUsuario);
router.post('/usuario/registro', registrarUsuario);

// Ruta protegida: necesita un token de usuario válido (ver middleware/auth.js).
router.get('/usuario/perfil', verificarUsuario, perfilUsuario);

// Ruta pública de login de administrador.
router.post('/admin/login', loginAdmin);

export default router;
