// authService.js maneja las peticiones de autenticación al backend.
// Centraliza las URLs de auth para no repetirlas en los componentes.

import api from '../api/axios.js';

// POST /api/auth/usuario/login -> Inicia sesión como usuario.
export const loginUsuario = async (email, contraseña) => {
  return api.post('/auth/usuario/login', { email, contraseña });
};

// POST /api/auth/usuario/registro -> Registra un nuevo usuario.
export const registrarUsuario = async ({ nombre, apellido, email, contraseña }) => {
  return api.post('/auth/usuario/registro', { nombre, apellido, email, contraseña });
};

// GET /api/auth/usuario/perfil -> Obtiene los datos del usuario logueado.
export const obtenerPerfilUsuario = async () => {
  return api.get('/auth/usuario/perfil');
};
