// Catalogo.jsx — listado dinámico de productos con filtro por categoría,
// búsqueda por nombre y paginación. Lee/escribe los filtros en la URL
// (useSearchParams) para que se puedan compartir o recargar sin perderlos.

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { obtenerCatalogo, obtenerCategoriasPublico } from '../services/catalogoService.js';
import { useCart } from '../context/CartContext.jsx';
import ProductoCard from '../components/catalogo/ProductoCard.jsx';

const LIMITE_POR_PAGINA = 12;

function Catalogo() {
  const { agregarItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoriaActual = searchParams.get('categoria') || '';
  const busquedaActual = searchParams.get('q') || '';
  const paginaActual = parseInt(searchParams.get('page') || '1', 10);

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [busquedaInput, setBusquedaInput] = useState(busquedaActual);

  // Las categorías se cargan una sola vez (no dependen de los filtros).
  useEffect(() => {
    obtenerCategoriasPublico().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  // El catálogo se recarga cada vez que cambia algún filtro de la URL.
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const resultado = await obtenerCatalogo({
          categoria: categoriaActual || undefined,
          q: busquedaActual || undefined,
          page: paginaActual,
          limit: LIMITE_POR_PAGINA,
        });
        setProductos(resultado.productos);
        setTotalPages(resultado.totalPages);
      } catch (err) {
        console.error('Error al cargar el catálogo:', err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [categoriaActual, busquedaActual, paginaActual]);

  const actualizarFiltro = (clave, valor) => {
    const params = new URLSearchParams(searchParams);
    if (valor) {
      params.set(clave, valor);
    } else {
      params.delete(clave);
    }
    params.set('page', '1'); // cualquier cambio de filtro vuelve a la página 1
    setSearchParams(params);
  };

  const irAPagina = (pagina) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(pagina));
    setSearchParams(params);
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    actualizarFiltro('q', busquedaInput.trim());
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Catálogo</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleBuscar} className="flex gap-2">
          <input
            value={busquedaInput}
            onChange={(e) => setBusquedaInput(e.target.value)}
            placeholder="Buscar productos..."
            className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button type="submit" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Buscar
          </button>
        </form>

        <select
          value={categoriaActual}
          onChange={(e) => actualizarFiltro('categoria', e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {cargando ? (
        <p className="text-slate-500">Cargando...</p>
      ) : productos.length === 0 ? (
        <p className="text-slate-500">No se encontraron productos con esos filtros.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} onAgregarAlCarrito={agregarItem} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => irAPagina(paginaActual - 1)}
                disabled={paginaActual <= 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-600">Página {paginaActual} de {totalPages}</span>
              <button
                onClick={() => irAPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Catalogo;
