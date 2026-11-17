// authService.js maneja las peticiones de autenticación al backend.
// Centraliza las URLs de auth para no repetirlas en los componentes.

import api from '../api/axios.js';

// POST /api/auth/usuario/login -> Inicia sesión como usuario.
export const loginUsuario = async (email, contraseña) => {
  return api.post('/auth/usuario/login', { email, contraseña });
};

// POST /api/auth/usuario/registro -> Paso 1: valida los datos y manda un código al email.
export const registrarUsuario = async ({ nombre, apellido, email, contraseña }) => {
  return api.post('/auth/usuario/registro', { nombre, apellido, email, contraseña });
};

// POST /api/auth/usuario/verificar-registro -> Paso 2: confirma el código y crea la cuenta.
export const verificarRegistroUsuario = async (email, codigo) => {
  return api.post('/auth/usuario/verificar-registro', { email, codigo });
};

// POST /api/auth/usuario/reenviar-codigo -> Manda un código nuevo al email.
export const reenviarCodigoUsuario = async (email) => {
  return api.post('/auth/usuario/reenviar-codigo', { email });
};

// GET /api/auth/usuario/perfil -> Obtiene los datos del usuario logueado.
export const obtenerPerfilUsuario = async () => {
  return api.get('/auth/usuario/perfil');
};

// PUT /api/auth/usuario/perfil -> Actualiza los datos del usuario logueado.
export const actualizarPerfilUsuario = async (datos) => {
  return api.put('/auth/usuario/perfil', datos);
};

// POST /api/auth/usuario/perfil/verificar-email -> Confirma con el código el cambio de email del perfil.
export const verificarEmailPerfilUsuario = async (codigo) => {
  return api.post('/auth/usuario/perfil/verificar-email', { codigo });
};

// ── MÓDULO B: recuperación de contraseña ──

// POST /api/auth/usuario/olvide-clave -> pide que se envíe el mail con el enlace.
export const solicitarRecuperacionClave = async (email) => {
  return api.post('/auth/usuario/olvide-clave', { email });
};

// POST /api/auth/usuario/restablecer-clave -> guarda la contraseña nueva.
// "token" es el que venía en el enlace del mail.
export const restablecerClaveConToken = async (token, contraseña) => {
  return api.post('/auth/usuario/restablecer-clave', { token, contraseña });
};
