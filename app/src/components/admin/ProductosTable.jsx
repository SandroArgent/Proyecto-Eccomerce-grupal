// ProductosTable.jsx — listado de productos en tabla, con acciones de
// Editar y Eliminar por fila. Es un componente "de presentación": no sabe
// nada de axios ni de la API, solo recibe datos y funciones por props.
// ProductosTable.jsx — listado de productos en tabla, con filtros y paginación

import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

function ProductosTable({ productos, categorias, onEditar, onEliminar }) {
  const [busqueda, setBusqueda] = useState("");
  const [marcaFiltro, setMarcaFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 5;

  const nombreCategoria = (idCategoria) => {
    const categoria = categorias.find((c) => c.id === idCategoria);
    return categoria ? categoria.nombre : "—";
  };

  // Filtrado (conversión de categoriaFiltro a número)
  const productosFiltrados = productos.filter((p) => {
    return (
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (marcaFiltro ? p.marca === marcaFiltro : true) &&
      (categoriaFiltro ? p.idCategoria === Number(categoriaFiltro) : true)
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
          <option value="">Todas las marcas</option>
          <option value="Yamaha">Yamaha</option>
          <option value="Fender">Fender</option>
          <option value="Gibson">Gibson</option>
          <option value="Roland">Roland</option>
          <option value="Casio">Casio</option>
          <option value="Tama">Tama</option>
          <option value="Pearl">Pearl</option>
          <option value="Shure">Shure</option>
          <option value="Boss">Boss</option>
          <option value="DAddario">Daddario</option>
          <option value="Dunlop">Dunlop</option>
          <option value="Hercules">Hercules</option>
          <option value="Vic Firth">Vic Firth</option>
          <option value="Audio-Technica">Audio-Technica</option>
          <option value="Ernie Ball">Ernie Ball</option>
          <option value="Cremona">Cremona</option>
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
      <div className="flex gap-2 mt-4">
        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i}
            onClick={() => setPaginaActual(i + 1)}
            className={`px-3 py-1 rounded ${
              paginaActual === i + 1
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductosTable