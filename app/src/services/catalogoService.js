// catalogoService.js — llamadas públicas al catálogo (no necesitan sesión).
// Usa la instancia "api" normal (no adminApi): la tienda pública no manda
// ningún token, el backend ya deja estas rutas abiertas.

import api from '../api/axios.js';

// GET /productos con filtros opcionales: categoria, q (búsqueda), page,
// limit, destacado. Devuelve { productos, total, page, totalPages }.
export const obtenerCatalogo = async ({ categoria, q, page, limit, destacado } = {}) => {
  return api.get('/productos', { params: { categoria, q, page, limit, destacado } });
};

export const obtenerProductoPorId = async (id) => {
  return api.get(`/productos/${id}`);
};

// Categorías públicas, para el selector de filtro del catálogo.
export const obtenerCategoriasPublico = async () => {
  return api.get('/categorias');
};
