// imagenUrl.js — arma la URL completa de una imagen guardada en el backend.
//
// En la base de datos se guarda solo la ruta ("/uploads/productos/abc.jpg").
// Para mostrarla en un <img> hay que anteponerle la dirección del servidor
// (VITE_API_URL sin el "/api" final => http://localhost:3000).
// Si la imagen es una URL externa (https://...) o una vista previa local
// (blob:), se devuelve tal cual: así los productos viejos siguen funcionando.

const ORIGEN_API = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

export const resolverUrlImagen = (ruta) => {
  if (!ruta) return null;
  if (/^(https?:)?\/\//.test(ruta) || ruta.startsWith('blob:') || ruta.startsWith('data:')) {
    return ruta;
  }
  return `${ORIGEN_API}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
};
