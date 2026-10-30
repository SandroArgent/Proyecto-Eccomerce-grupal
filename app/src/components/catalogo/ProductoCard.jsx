// ProductoCard.jsx — tarjeta de producto reutilizada en Home y Catálogo.
// Componente "tonto": recibe el producto y una función para agregarlo al
// carrito, no sabe nada de contextos ni de la API.

import { Link } from 'react-router-dom';

function ProductoCard({ producto, onAgregarAlCarrito }) {
  const sinStock = producto.stock <= 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/productos/${producto.id}`} className="aspect-square overflow-hidden bg-slate-100">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">Sin imagen</div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to={`/productos/${producto.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
          {producto.nombre}
        </Link>
        {producto.marca && <p className="text-xs text-slate-500">{producto.marca}</p>}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-slate-900">
            ${Number(producto.precio).toLocaleString('es-AR')}
          </span>
          <button
            onClick={() => onAgregarAlCarrito(producto)}
            disabled={sinStock}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {sinStock ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductoCard;
