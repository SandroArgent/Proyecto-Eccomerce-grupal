import adminApi from '../api/adminAxios.js';

export const obtenerMarcas = async () => {
  return await adminApi.get('/marcas');
};

export const crearMarca = async (datos) => {
  return await adminApi.post('/marcas', datos);
};

export const actualizarMarca = async (id, datos) => {
  return await adminApi.put(`/marcas/${id}`, datos);
};

export const eliminarMarca = async (id) => {
  return await adminApi.delete(`/marcas/${id}`);
};