// categoriaService.js — llamadas al backend para el CRUD de categorías,
// usadas desde el panel de administración.

import adminApi from '../api/adminAxios.js';

export const obtenerCategorias = async () => {
  return adminApi.get('/categorias');
};

export const crearCategoria = async (datos) => {
  return adminApi.post('/categorias', datos);
};

export const actualizarCategoria = async (id, datos) => {
  return adminApi.put(`/categorias/${id}`, datos);
};

export const eliminarCategoria = async (id) => {
  return adminApi.delete(`/categorias/${id}`);
};
