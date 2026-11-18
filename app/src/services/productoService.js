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

// Para subir archivos no se puede mandar JSON: hay que usar FormData
// (multipart/form-data). Los campos de texto van como campos normales y
// cada archivo se agrega bajo el nombre "imagenes", que es el que espera
// Multer en el backend (upload.array('imagenes')).
// OJO: no hay que setear el header Content-Type a mano; axios/el navegador
// lo arman solos, incluyendo el "boundary" que separa las partes.
const construirFormData = ({ archivos = [], imagenesEliminar = [], ...campos }) => {
  const formData = new FormData();

  Object.entries(campos).forEach(([clave, valor]) => {
    formData.append(clave, valor ?? ''); // null => '' (el backend lo convierte a null)
  });

  if (imagenesEliminar.length > 0) {
    formData.append('imagenesEliminar', JSON.stringify(imagenesEliminar));
  }
  archivos.forEach((archivo) => formData.append('imagenes', archivo));

  return formData;
};

// Subir imágenes tarda más que un request normal: ampliamos el timeout de 5s.
const OPCIONES_SUBIDA = { timeout: 30000 };

export const crearProducto = async (datos) => {
  return adminApi.post('/productos', construirFormData(datos), OPCIONES_SUBIDA);
};

export const actualizarProducto = async (id, datos) => {
  return adminApi.put(`/productos/${id}`, construirFormData(datos), OPCIONES_SUBIDA);
};

export const eliminarProducto = async (id) => {
  return adminApi.delete(`/productos/${id}`);
};
