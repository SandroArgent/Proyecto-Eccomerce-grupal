// uploads.js — dónde se guardan los archivos subidos y con qué URL se sirven.
//
// Los archivos viven en api/uploads/productos/ (en disco, fuera de src/).
// En la base de datos NO se guarda el archivo, solo la ruta pública
// (ej: "/uploads/productos/1731880000000-ab12.jpg"). Así, si algún día
// cambian de servidor o suben las imágenes a la nube, solo cambia esta
// configuración y no los datos guardados.

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
export const PRODUCTOS_DIR = path.join(UPLOADS_DIR, 'productos');

// Prefijo con el que Express expone la carpeta (ver app.js).
export const URL_PUBLICA_PRODUCTOS = '/uploads/productos';
