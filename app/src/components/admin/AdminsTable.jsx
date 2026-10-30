import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

function AdminsTable({ administradores, onEditar, onEliminar }) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const adminsPorPagina = 5;

  // Filtrado por nombre o email
  const adminsFiltrados = administradores.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Paginación
  const indiceUltimo = paginaActual * adminsPorPagina;
  const indicePrimero = indiceUltimo - adminsPorPagina;
  const adminsPagina = adminsFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(adminsFiltrados.length / adminsPorPagina);

  if (administradores.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
        No hay administradores cargados todavía.
      </div>
    );
  }

  return (
    <div>
      {/* Filtro */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white text-sm"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {adminsPagina.map((admin) => (
              <tr
                key={admin.id}
                className="border-t border-slate-800 hover:bg-slate-900/50"
              >
                <td className="px-4 py-3 font-medium text-white">{admin.nombre}</td>
                <td className="px-4 py-3">{admin.email}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button
                    onClick={() => onEditar(admin)}
                    className="rounded-lg border border-slate-600 p-1 text-slate-200 hover:bg-slate-800"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEliminar(admin)}
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

export default AdminsTable;