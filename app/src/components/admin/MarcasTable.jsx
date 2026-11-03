import {
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

function MarcasTable({
  marcas,
  onEditar,
  onEliminar,
}) {
  if (marcas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
        No hay marcas cargadas todavía.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">
              Nombre
            </th>

            <th className="px-4 py-3 text-right">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {marcas.map((marca) => (
            <tr
              key={marca.id}
              className="border-t border-slate-800 hover:bg-slate-900/50"
            >
              <td className="px-4 py-3 font-medium text-white">
                {marca.nombre}
              </td>

              <td className="flex justify-end gap-2 px-4 py-3 text-right">
                <button
                  onClick={() => onEditar(marca)}
                  className="rounded-lg border border-slate-600 p-1 text-slate-200 hover:bg-slate-800"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>

                <button
                  onClick={() => onEliminar(marca)}
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
  );
}

export default MarcasTable;