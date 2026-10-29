// Importamos axios.
import axios from 'axios';

// Creamos una instancia con la URL base del backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000, // Si la petición tarda más de 5 segundos, da error.
});

// Interceptor de peticiones: agrega el token JWT guardado en localStorage
// (si existe) en el header Authorization de cada petición. Así no hay que
// acordarse de hacerlo a mano en cada llamada a la API.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuestas: "desenvuelve" la respuesta del backend.
// Nuestros controllers de auth devuelven { estado: true, data/token/... }.
// Si viene un campo "data", devolvemos directamente ese campo para no
// tener que escribir response.data.data en cada componente.
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;

    // 401 = "no mandaste un token válido" / 403 = "tu token es válido,
    // pero no tenés permiso para esto". En los dos casos la sesión del
    // cliente ya no sirve (o nunca sirvió), así que la limpiamos y lo
    // mandamos al login para que vuelva a entrar.
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    const data = error.response?.data;
    const mensaje = data?.errores?.length
      ? data.errores.join(' ')
      : data?.mensaje || error.message;
    return Promise.reject(new Error(mensaje));
  }
);

// Exportamos la instancia para usarla en otros archivos.
export default api;

