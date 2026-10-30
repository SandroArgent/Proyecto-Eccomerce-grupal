// auth.js contiene los middlewares que protegen las rutas del backend.
// Un middleware es una función que se ejecuta antes de llegar al controlador.
// Aquí verificamos que el token JWT sea válido y que quien lo envía sea
// realmente un usuario o un administrador, según lo que pida la ruta.

import jwt from 'jsonwebtoken';
import { JWT_SECRET_USUARIO, JWT_SECRET_ADMIN } from '../utils/auth.js';
import { Usuario, Administrador } from '../models/index.js';

/**
 * verificarToken
 * Recibe el secreto con el que debe estar firmado el token y devuelve
 * un middleware que:
 * - Lee el token del header Authorization.
 * - Lo verifica con el secreto recibido.
 * - Guarda el payload decodificado en req.auth.
 */
export const verificarToken = (secret) => (req, res, next) => {
  try {
    // El token viene en el header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        estado: false,
        mensaje: 'No se proporcionó un token de autenticación',
      });
    }

    // Separamos la palabra "Bearer" del token propiamente dicho.
    const token = authHeader.split(' ')[1];

    // Verifica la firma y que no haya expirado. Si algo falla, tira una excepción
    // y caemos directo al catch de abajo.
    const payload = jwt.verify(token, secret);

    req.auth = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      estado: false,
      mensaje: 'Token inválido o expirado',
      error: error.message,
    });
  }
};

/**
 * verificarUsuario
 * Middleware para rutas que solo pueden usar usuarios logueados
 * (por ejemplo, ver o modificar su propio carrito, hacer una compra, etc.).
 * Verifica el token con el secreto de usuario y carga el registro completo
 * de la base de datos en req.usuario, para que el controller no tenga
 * que volver a buscarlo.
 */
export const verificarUsuario = (req, res, next) => {
  verificarToken(JWT_SECRET_USUARIO)(req, res, async (err) => {
    if (err) return next(err);

    try {
      const usuario = await Usuario.findByPk(req.auth.id);

      if (!usuario) {
        return res.status(403).json({
          estado: false,
          mensaje: 'Usuario no encontrado',
        });
      }

      req.usuario = usuario;
      next();
    } catch (error) {
      console.error('Error en verificarUsuario:', error);
      return res.status(500).json({
        estado: false,
        mensaje: 'Error al verificar usuario',
        error: error.message,
      });
    }
  });
};

/**
 * verificarAdmin
 * Middleware para rutas exclusivas de administradores (por ejemplo,
 * crear/editar/borrar productos y categorías, o gestionar administradores).
 * Verifica el token con el secreto de admin y carga el registro completo
 * en req.administrador.
 */
export const verificarAdmin = (req, res, next) => {
  verificarToken(JWT_SECRET_ADMIN)(req, res, async (err) => {
    if (err) return next(err);

    try {
      const administrador = await Administrador.findByPk(req.auth.id);

      if (!administrador) {
        return res.status(403).json({
          estado: false,
          mensaje: 'Administrador no encontrado',
        });
      }

      req.administrador = administrador;
      next();
    } catch (error) {
      console.error('Error en verificarAdmin:', error);
      return res.status(500).json({
        estado: false,
        mensaje: 'Error al verificar administrador',
        error: error.message,
      });
    }
  });
};
