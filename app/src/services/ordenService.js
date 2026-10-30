// ordenService.js — checkout y "mis pedidos", usando la sesión de usuario
// cliente (api, con el token normal, no el de admin).

import api from '../api/axios.js';

// POST /compras — confirma la compra. datos = { items: [{idProducto, cantidad}], medioPago }
export const crearCompra = async (datos) => {
  return api.post('/compras', datos);
};

// GET /compras — historial del usuario logueado.
export const obtenerMisCompras = async () => {
  return api.get('/compras');
};
