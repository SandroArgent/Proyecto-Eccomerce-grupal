import adminApi from '../api/adminAxios.js';

// GET /api/usuarios -> Obtiene todos los usuarios.
export const obtenerUsuarios = async () => {
  return adminApi.get('/usuarios');
};