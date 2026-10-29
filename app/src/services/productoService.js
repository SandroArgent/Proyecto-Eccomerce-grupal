// productoService.js — llamadas al backend para el CRUD de productos,
// usadas desde el panel de administración.

import adminApi from '../api/adminAxios.js';

// GET /productos ahora devuelve { productos, total, page, totalPages }
// (se agregó paginación para el catálogo público en Etapa 4). El panel de
// admin no pagina todavía, así que pide un límite alto para traer "todo".
export const obtenerProductos = async () => {
  const resultado = await adminApi.get('/productos', { params: { limit: 1000 } });
  return resultado.productos;
};

export const crearProducto = async (datos) => {
  return adminApi.post('/productos', datos);
};

export const actualizarProducto = async (id, datos) => {
  return adminApi.put(`/productos/${id}`, datos);
};

export const eliminarProducto = async (id) => {
  return adminApi.delete(`/productos/${id}`);
};
