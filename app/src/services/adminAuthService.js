// adminAuthService.js — llamada de login de administrador al backend.

import adminApi from '../api/adminAxios.js';

// POST /api/auth/admin/login
export const loginAdmin = async (email, contraseña) => {
  return adminApi.post('/auth/admin/login', { email, contraseña });
};
