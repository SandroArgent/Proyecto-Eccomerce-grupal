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

// ─────────────────────────────────────────────────────────────────────
// MÓDULO B — Recuperación de contraseña
// ─────────────────────────────────────────────────────────────────────
// Cuando alguien olvida su contraseña, le mandamos por mail un enlace con
// un token. Ese token tiene que cumplir tres reglas:
//   1) Que nadie pueda inventarlo ni falsificarlo (se firma con un secreto).
//   2) Que venza solo (acá: 1 hora).
//   3) Que sirva UNA sola vez (si ya cambiaste la contraseña, el enlace
//      viejo tiene que dejar de funcionar).
//
// Para cumplir la regla 3 SIN agregar columnas nuevas a la base de datos,
// usamos un truco: el secreto con el que se firma el token incluye el hash
// de la contraseña ACTUAL del usuario. Cuando la contraseña cambia, el hash
// cambia, y entonces el secreto cambia: todos los tokens firmados con el
// secreto viejo dejan de pasar la verificación automáticamente.

// Es una función (y no una constante) a propósito: así lee process.env en el
// momento de usarla, y no depende de que dotenv ya haya cargado el .env
// cuando se importó este archivo.
const secretoRecuperacion = (usuario) =>
  (process.env.JWT_SECRET_RECUPERACION || 'clave_por_defecto_recuperacion') + usuario.contraseña;

/**
 * Genera el token que viaja dentro del enlace del mail.
 * Guarda solo el id del usuario y una marca "tipo" para distinguirlo de
 * los tokens de sesión (login).
 */
export const generarTokenRecuperacion = (usuario) => {
  return jwt.sign({ id: usuario.id, tipo: 'recuperacion' }, secretoRecuperacion(usuario), {
    expiresIn: '1h',
  });
};

/**
 * Lee el id del usuario que está escrito DENTRO del token, sin verificar
 * la firma todavía. ¿Por qué hace falta? Porque para verificar la firma
 * necesitamos el secreto, y el secreto depende de la contraseña del
 * usuario... así que primero tenemos que saber de QUÉ usuario se trata.
 * Es seguro porque después de esto SIEMPRE se llama a
 * verificarTokenRecuperacion, que es la que de verdad valida.
 */
export const leerIdDeTokenRecuperacion = (token) => {
  const contenido = jwt.decode(token);
  if (!contenido || contenido.tipo !== 'recuperacion') return null;
  return contenido.id;
};

/**
 * Verifica firma y vencimiento. Si el token es inválido, está vencido, o ya
 * se usó (la contraseña cambió), esta función lanza un error.
 */
export const verificarTokenRecuperacion = (token, usuario) => {
  return jwt.verify(token, secretoRecuperacion(usuario));
};
