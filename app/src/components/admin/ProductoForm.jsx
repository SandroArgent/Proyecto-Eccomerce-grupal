// ProductoForm.jsx — formulario de creación/edición de un producto.
// Sirve para ambos casos: si "producto" viene con id, es una edición;
// si viene vacío ({}), es un alta nueva. El feedback visual (mensajes de
// error, botón deshabilitado mientras guarda) lo maneja este componente.

import { useState, useEffect, useRef } from 'react';
import { obtenerMarcas } from '../../services/marcaService.js';
import { resolverUrlImagen } from '../../utils/imagenUrl.js';

// Mismos límites que el backend (api/src/middleware/upload.js).
const MAX_IMAGENES = 5;
const MAX_TAMANO_MB = 5;
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function ProductoForm({ producto, categorias, onGuardar, onCancelar, guardando, error }) {
  const esEdicion = Boolean(producto?.id);
  const [marcas, setMarcas] = useState([]);

  const [form, setForm] = useState({
    nombre: producto?.nombre || '',
    descripcion: producto?.descripcion || '',
    precio: producto?.precio ?? '',
    stock: producto?.stock ?? '',
    marca: producto?.marca || '',
    destacado: producto?.destacado || false,
    idCategoria: producto?.idCategoria || '',
  });

  // Manejo de imágenes:
  //  - existentes: las que el producto ya tiene guardadas (solo en edición)
  //  - eliminar:   ids de las existentes que el admin quitó (se borran al guardar)
  //  - nuevos:     archivos elegidos en este formulario, con su vista previa
  const [existentes] = useState(producto?.ImagenProductos || []);
  const [eliminar, setEliminar] = useState([]);
  const [nuevos, setNuevos] = useState([]);
  const [errorArchivos, setErrorArchivos] = useState('');

  const existentesVisibles = existentes.filter((img) => !eliminar.includes(img.id));
  const totalImagenes = existentesVisibles.length + nuevos.length;

  // Liberamos las vistas previas (URL.createObjectURL) al cerrar el formulario.
  const nuevosRef = useRef([]);
  useEffect(() => {
    nuevosRef.current = nuevos;
  }, [nuevos]);
  useEffect(() => () => {
    nuevosRef.current.forEach((n) => URL.revokeObjectURL(n.preview));
  }, []);

useEffect(() => {
  const cargarMarcas = async () => {
    try {
      const data = await obtenerMarcas();
      setMarcas(data);
    } catch (error) {
      console.error(
        'Error al cargar marcas:',
        error
      );
    }
  };

  cargarMarcas();
}, []);

const handleArchivos = (e) => {
  const elegidos = Array.from(e.target.files);
  e.target.value = ''; // permite volver a elegir el mismo archivo

  let mensaje = '';
  const validos = [];

  for (const archivo of elegidos) {
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      mensaje = 'Solo se permiten imágenes JPG, PNG, WEBP o GIF.';
    } else if (archivo.size > MAX_TAMANO_MB * 1024 * 1024) {
      mensaje = `Cada imagen puede pesar como máximo ${MAX_TAMANO_MB} MB.`;
    } else {
      validos.push(archivo);
    }
  }

  const lugarDisponible = MAX_IMAGENES - totalImagenes;
  if (validos.length > lugarDisponible) {
    mensaje = `Un producto puede tener como máximo ${MAX_IMAGENES} imágenes.`;
  }

  setErrorArchivos(mensaje);
  setNuevos((prev) => [
    ...prev,
    ...validos.slice(0, Math.max(lugarDisponible, 0)).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    })),
  ]);
};

const quitarNuevo = (index) => {
  URL.revokeObjectURL(nuevos[index].preview);
  setNuevos((prev) => prev.filter((_, i) => i !== index));
  setErrorArchivos('');
};

const quitarExistente = (id) => {
  setEliminar((prev) => [...prev, id]);
  setErrorArchivos('');
};

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convertimos precio/stock a número y mandamos idCategoria como
    // null si no se eligió ninguna, para no romper la foreign key.
    onGuardar({
      ...form,
      precio: Number(form.precio),
      stock: Number(form.stock),
      idCategoria: form.idCategoria || null,
      archivos: nuevos.map((n) => n.file),
      imagenesEliminar: eliminar,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold text-white">
        {esEdicion ? `Editar: ${producto.nombre}` : 'Nuevo producto'}
      </h2>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-300">Nombre *</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-300">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Precio *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Stock *</label>
          <input
            type="number"
            step="1"
            min="0"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div>
  <label className="mb-1 block text-sm font-medium text-slate-300">
    Marca
  </label>
  <select
    name="marca"
    value={form.marca}
    onChange={handleChange}
    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
  >
    <option value="">Selecciona una marca</option>
   {marcas.map((marca) => (
      <option
        key={marca.id}
        value={marca.nombre}
      >
        {marca.nombre}
      </option>
    ))}
  </select>
</div>


        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Categoría</label>
          <select
            name="idCategoria"
            value={form.idCategoria}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2 space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Imágenes del producto ({totalImagenes}/{MAX_IMAGENES})
          </label>
          <p className="text-xs text-slate-500">
            JPG, PNG, WEBP o GIF, hasta {MAX_TAMANO_MB} MB cada una. La primera es la imagen principal.
          </p>

          {errorArchivos && <p className="text-sm text-red-400">{errorArchivos}</p>}

          {(existentesVisibles.length > 0 || nuevos.length > 0) && (
            <div className="flex flex-wrap gap-3">
              {existentesVisibles.map((img) => (
                <div key={`e-${img.id}`} className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-600">
                  <img src={resolverUrlImagen(img.urlImagen)} alt={img.nombre} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => quitarExistente(img.id)}
                    className="absolute right-1 top-1 rounded-full bg-red-600 px-1.5 text-xs font-bold text-white hover:bg-red-500"
                    aria-label="Quitar imagen"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {nuevos.map((n, i) => (
                <div key={`n-${n.preview}`} className="relative h-24 w-24 overflow-hidden rounded-lg border border-indigo-500">
                  <img src={n.preview} alt={n.file.name} className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 left-0 bg-indigo-600 px-1 text-[10px] text-white">Nueva</span>
                  <button
                    type="button"
                    onClick={() => quitarNuevo(i)}
                    className="absolute right-1 top-1 rounded-full bg-red-600 px-1.5 text-xs font-bold text-white hover:bg-red-500"
                    aria-label="Quitar imagen"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalImagenes < MAX_IMAGENES && (
            <input
              type="file"
              accept={TIPOS_PERMITIDOS.join(',')}
              multiple
              onChange={handleArchivos}
              className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500"
            />
          )}
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="destacado"
            name="destacado"
            checked={form.destacado}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-600 bg-slate-800"
          />
          <label htmlFor="destacado" className="text-sm text-slate-300">Producto destacado</label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default ProductoForm;
