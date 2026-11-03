// ProductosTable.jsx — listado de productos en tabla, con acciones de
// Editar y Eliminar por fila. Es un componente "de presentación": no sabe
// nada de axios ni de la API, solo recibe datos y funciones por props.
// ProductosTable.jsx — listado de productos en tabla, con filtros y paginación

import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState, useEffect  } from "react";
import { obtenerMarcas } from "../../services/marcaService.js";

function ProductosTable({ productos, categorias, onEditar, onEliminar }) {
  const [busqueda, setBusqueda] = useState("");
  const [marcaFiltro, setMarcaFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [marcas, setMarcas] = useState([]);
  const productosPorPagina = 5;

  useEffect(() => {
  const cargarMarcas = async () => {
    try {
      const data = await obtenerMarcas();
      setMarcas(data);
    } catch (error) {
      console.error(
        "Error al cargar marcas:",
        error
      );
    }
  };

  cargarMarcas();
}, []);

  const nombreCategoria = (idCategoria) => {
    const categoria = categorias.find((c) => c.id === idCategoria);
    return categoria ? categoria.nombre : "—";
  };


  //categorias permitidas dentro de categorias padres
  const categoriasPermitidas = categoriaFiltro
  ? [
      Number(categoriaFiltro),

      ...categorias
        .filter(
          (c) =>
            c.idCategoriaPadre ===
            Number(categoriaFiltro)
        )
        .map((c) => c.id),
    ]
  : [];

  // Filtrado (conversión de categoriaFiltro a número)
  const productosFiltrados = productos.filter((p) => {
    return (
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (marcaFiltro ? p.marca === marcaFiltro : true) &&
      (categoriaFiltro
  ? categoriasPermitidas.includes(
      p.idCategoria
    )
  : true)
    );
  });

  // Paginación
  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;
  const productosPagina = productosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  if (productos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
        No hay productos cargados todavía.
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white text-sm"
        />

        <select
          value={marcaFiltro}
          onChange={(e) => setMarcaFiltro(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white text-sm"
        >
          <option value="">
            Todas las marcas
          </option>
            
          {marcas.map((marca) => (
            <option
              key={marca.id}
              value={marca.nombre}
            >
              {marca.nombre}
            </option>
          ))}
        </select>

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3">Destacado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosPagina.map((producto) => (
              <tr
                key={producto.id}
                className="border-t border-slate-800 hover:bg-slate-900/50"
              >
                <td className="px-4 py-3 font-medium text-white">
                  {producto.nombre}
                </td>
                <td className="px-4 py-3">
                  {nombreCategoria(producto.idCategoria)}
                </td>
                <td className="px-4 py-3 text-right">
                  ${Number(producto.precio).toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3 text-right">{producto.stock}</td>
                <td className="px-4 py-3">
                  {producto.destacado ? "Sí" : "No"}
                </td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button
                    onClick={() => onEditar(producto)}
                    className="rounded-lg border border-slate-600 p-1 text-slate-200 hover:bg-slate-800"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEliminar(producto)}
                    className="rounded-lg border border-red-800 p-1 text-red-400 hover:bg-red-950"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
     <div className="flex items-center justify-center gap-4 pt-4">
  <button
    onClick={() =>
      setPaginaActual((prev) =>
        Math.max(prev - 1, 1)
      )
    }
    disabled={paginaActual === 1}
    className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 disabled:opacity-40"
  >
    ← Anterior
  </button>

  <span className="text-slate-300">
    Página {paginaActual} de {totalPaginas || 1}
  </span>

  <button
    onClick={() =>
      setPaginaActual((prev) =>
        Math.min(prev + 1, totalPaginas)
      )
    }
    disabled={paginaActual === totalPaginas}
    className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 disabled:opacity-40"
  >
    Siguiente →
  </button>
</div>
    </div>
  );
}

export default ProductosTable