// ProductoDetalle.jsx — vista de detalle: galería, info ampliada y botón
// "Agregar al carrito", tal como pide la consigna de Etapa 4.

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerProductoPorId } from '../services/catalogoService.js';
import { useCart } from '../context/CartContext.jsx';

function ProductoDetalle() {
  const { id } = useParams();
  const { agregarItem } = useCart();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [imagenActiva, setImagenActiva] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError('');
      try {
        const data = await obtenerProductoPorId(id);
        setProducto(data);
        setImagenActiva(data.imagen || data.ImagenProductos?.[0]?.urlImagen || null);
      } catch (err) {
        console.error('Error al cargar el producto:', err);
        setError('No se pudo cargar el producto.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const handleAgregar = () => {
    agregarItem(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (cargando) return <p className="p-8 text-center text-slate-500">Cargando...</p>;
  if (error || !producto) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>{error || 'Producto no encontrado.'}</p>
        <Link to="/catalogo" className="mt-2 inline-block text-indigo-600 hover:underline">Volver al catálogo</Link>
      </div>
    );
  }

  // Todas las imágenes: la principal (producto.imagen) + la galería
  // (ImagenProductos, la relación 1:n del DER). Sequelize pone el alias
  // en plural automáticamente porque la asociación no definió un "as".
  const galeria = [
    ...(producto.imagen ? [producto.imagen] : []),
    ...(producto.ImagenProductos?.map((img) => img.urlImagen) || []),
  ];

  const sinStock = producto.stock <= 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {imagenActiva ? (
              <img src={imagenActiva} alt={producto.nombre} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">Sin imagen</div>
            )}
          </div>

          {galeria.length > 1 && (
            <div className="mt-3 flex gap-2">
              {galeria.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setImagenActiva(url)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${imagenActiva === url ? 'border-indigo-600' : 'border-transparent'}`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {producto.Categoria && (
            <p className="text-xs uppercase tracking-wide text-slate-400">{producto.Categoria.nombre}</p>
          )}
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{producto.nombre}</h1>
          {producto.marca && <p className="mt-1 text-slate-500">{producto.marca}</p>}

          <p className="mt-4 text-3xl font-bold text-slate-900">
            ${Number(producto.precio).toLocaleString('es-AR')}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {sinStock ? 'Sin stock disponible' : `${producto.stock} unidades disponibles`}
          </p>

          {producto.descripcion && (
            <p className="mt-6 whitespace-pre-line text-slate-700">{producto.descripcion}</p>
          )}

          {producto.caracteristicasDetalladas && (
            <div className="mt-4">
              <h2 className="font-semibold text-slate-900">Características</h2>
              <p className="whitespace-pre-line text-sm text-slate-600">{producto.caracteristicasDetalladas}</p>
            </div>
          )}

          {!sinStock && (
            <div className="mt-6 flex items-center gap-3">
              <input
                type="number"
                min="1"
                max={producto.stock}
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, Math.min(producto.stock, Number(e.target.value))))}
                className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center"
              />
              <button
                onClick={handleAgregar}
                className="flex-1 rounded-xl bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-500"
              >
                {agregado ? '¡Agregado!' : 'Agregar al carrito'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductoDetalle;
