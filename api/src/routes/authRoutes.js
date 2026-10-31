import { Router } from 'express';
import {
  loginUsuario,
  registrarUsuario,
  perfilUsuario,
  loginAdmin,
  olvideClave,
  restablecerClave,
} from '../controllers/authController.js';
import { verificarUsuario } from '../middleware/auth.js';

const router = Router();

// Rutas públicas de usuario (cualquiera puede llamarlas sin token).
router.post('/usuario/login', loginUsuario);
router.post('/usuario/registro', registrarUsuario);

// MÓDULO B — recuperación de contraseña. Son públicas: quien olvidó su
// clave, por definición, no puede estar logueado.
router.post('/usuario/olvide-clave', olvideClave);
router.post('/usuario/restablecer-clave', restablecerClave);

// Ruta protegida: necesita un token de usuario válido (ver middleware/auth.js).
router.get('/usuario/perfil', verificarUsuario, perfilUsuario);

// Ruta pública de login de administrador.
router.post('/admin/login', loginAdmin);

export default router;
