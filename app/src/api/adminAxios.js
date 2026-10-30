// adminAxios.js — instancia separada de axios para el panel de administración.
//
// ¿Por qué una instancia aparte en vez de reusar api/axios.js?
// Porque un usuario cliente y un administrador son sesiones completamente
// distintas (dos tablas, dos secretos JWT). Si guardáramos los dos tokens
// bajo la misma clave "token" en localStorage, loguearte como admin en
// una pestaña pisaría la sesión de cliente en la otra, y viceversa.
// Por eso el token de admin se guarda bajo la clave "adminToken", separada.

import axios from 'axios';

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
});

adminApi.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;

    // Mismo razonamiento que en api/axios.js, pero para la sesión de
    // administrador: si el token de admin es inválido/expiró (401) o no
    // alcanza para esta acción (403), limpiamos esa sesión puntual y
    // mandamos de vuelta a /admin/login — sin tocar la sesión del
    // usuario cliente, que es independiente.
    if (status === 401 || status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('administrador');
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }

    // Si el backend valida los datos (validarProducto/validarCategoria)
    // y falla, manda un array "errores" además de "mensaje". Lo unimos
    // en un solo texto para mostrarlo fácil en los formularios.
    const data = error.response?.data;
    const mensaje = data?.errores?.length
      ? data.errores.join(' ')
      : data?.mensaje || error.message;
    return Promise.reject(new Error(mensaje));
  }
);

export default adminApi;
