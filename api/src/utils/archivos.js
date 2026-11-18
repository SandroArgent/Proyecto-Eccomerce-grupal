// archivos.js — helpers para trabajar con los archivos subidos en disco.

import fs from 'fs/promises';
import path from 'path';
import { PRODUCTOS_DIR, URL_PUBLICA_PRODUCTOS } from '../config/uploads.js';

// Convierte un archivo que acaba de guardar multer en la ruta pública
// que se guarda en la base de datos.
export const urlPublica = (file) => `${URL_PUBLICA_PRODUCTOS}/${file.filename}`;

// Borra del disco un archivo a partir de su ruta pública guardada en la BD.
// Ignora URLs externas (https://...) y rutas que no sean de /uploads/productos,
// y usa path.basename para que nadie pueda escapar de la carpeta con "../".
export const borrarArchivoPorUrl = async (url) => {
  if (typeof url !== 'string' || !url.startsWith(`${URL_PUBLICA_PRODUCTOS}/`)) return;
  const nombre = path.basename(url);
  try {
    await fs.unlink(path.join(PRODUCTOS_DIR, nombre));
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('No se pudo borrar el archivo:', error.message);
  }
};

// Borra archivos que multer ya guardó pero que ya no sirven
// (por ejemplo, porque la validación falló o hubo un error al guardar en la BD).
export const borrarArchivosSubidos = async (files = []) => {
  await Promise.all(
    files.map((f) => fs.unlink(f.path).catch(() => {}))
  );
};
