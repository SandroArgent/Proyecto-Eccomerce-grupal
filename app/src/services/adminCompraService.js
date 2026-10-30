import adminApi from '../api/adminAxios.js';

export const obtenerTodasLasCompras = async () => {
  const data = await adminApi.get('/compras/admin');
  return data;
};