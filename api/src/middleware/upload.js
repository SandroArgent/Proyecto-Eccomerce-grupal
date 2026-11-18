// upload.js — configuración de Multer para subir imágenes de productos.
//
// Multer es el middleware que sabe leer peticiones "multipart/form-data"
// (las que mandan archivos) y guardar los archivos en disco. Después de
// pasar por acá, en el controller tenemos:
//   req.files -> array con los archivos guardados (filename, path, size...)
//   req.body  -> los campos de texto del formulario (siempre como string)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { PRODUCTOS_DIR } from '../config/uploads.js';

export const MAX_IMAGENES_POR_PRODUCTO = 5;
const MAX_TAMANO_BYTES = 5 * 1024 * 1024; // 5 MB por imagen

// Tipos permitidos: mimetype -> extensiones válidas.
const TIPOS_PERMITIDOS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

// Si la carpeta no existe, la crea (así no hay que crearla a mano).
fs.mkdirSync(PRODUCTOS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PRODUCTOS_DIR),
  filename: (req, file, cb) => {
    // Nombre propio y único: evita que dos archivos "foto.jpg" se pisen
    // y evita usar el nombre que mandó el cliente (que no es de fiar).
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const extensionesValidas = TIPOS_PERMITIDOS[file.mimetype];

  if (!extensionesValidas || !extensionesValidas.includes(ext)) {
    const error = new Error('Solo se permiten imágenes JPG, PNG, WEBP o GIF.');
    error.code = 'TIPO_INVALIDO';
    return cb(error);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_TAMANO_BYTES, files: MAX_IMAGENES_POR_PRODUCTO },
});

// Middleware para las rutas de productos: acepta hasta 5 archivos en el
// campo "imagenes". Lo envolvemos para que los errores de Multer (archivo
// muy pesado, tipo inválido, etc.) lleguen al front como un 400 con el
// mismo formato { estado, mensaje } que usa el resto de la API.
export const subirImagenesProducto = (req, res, next) => {
  upload.array('imagenes', MAX_IMAGENES_POR_PRODUCTO)(req, res, (err) => {
    if (!err) return next();

    let mensaje = err.message;
    if (err.code === 'LIMIT_FILE_SIZE') {
      mensaje = `Cada imagen puede pesar como máximo ${MAX_TAMANO_BYTES / 1024 / 1024} MB.`;
    } else if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      mensaje = `Se pueden subir como máximo ${MAX_IMAGENES_POR_PRODUCTO} imágenes por producto.`;
    } else if (err.code !== 'TIPO_INVALIDO') {
      console.error('Error inesperado en la subida de archivos:', err);
      return res.status(500).json({ estado: false, mensaje: 'Error al subir los archivos.' });
    }

    // Si multer alcanzó a guardar algún archivo antes del error, lo limpiamos.
    if (req.files?.length) {
      req.files.forEach((f) => fs.unlink(f.path, () => {}));
    }
    res.status(400).json({ estado: false, mensaje });
  });
};
