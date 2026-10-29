// auth.js contiene funciones reutilizables para manejar contraseñas y tokens.
// - bcryptjs: se usa para encriptar y comparar contraseñas de forma segura.
// - jsonwebtoken: se usa para firmar y verificar tokens de sesión.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Cost factor de bcrypt: cuanto más alto, más seguro pero más lento.
// 10 es un valor estándar y equilibrado.
const SALT_ROUNDS = 10;

// Usamos dos secretos distintos para firmar los tokens:
// uno para usuarios (clientes del ecommerce) y otro para administradores.
// Así, un token de usuario nunca va a poder usarse en una ruta de admin
// (y viceversa), aunque alguien intente cambiar el campo "tipo" a mano.
export const JWT_SECRET_USUARIO = process.env.JWT_SECRET_USUARIO || 'clave_por_defecto_usuario';
export const JWT_SECRET_ADMIN = process.env.JWT_SECRET_ADMIN || 'clave_por_defecto_admin';

/**
 * Encripta una contraseña en texto plano.
 * @param {string} password - Contraseña en texto plano.
 * @returns {Promise<string>} - Contraseña encriptada (hash).
 */
export const encriptarPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compara una contraseña en texto plano con un hash guardado.
 * @param {string} password - Contraseña en texto plano.
 * @param {string} hash - Hash guardado en la base de datos.
 * @returns {Promise<boolean>} - true si coinciden, false si no.
 */
export const compararPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Genera un token JWT con los datos del usuario o administrador.
 * @param {object} payload - Datos a guardar en el token (id, email, tipo, etc.).
 * @param {string} secret - Secreto con el que se firma el token.
 * @returns {string} - Token firmado.
 */
export const generarToken = (payload, secret) => {
  return jwt.sign(payload, secret, { expiresIn: '24h' });
};
