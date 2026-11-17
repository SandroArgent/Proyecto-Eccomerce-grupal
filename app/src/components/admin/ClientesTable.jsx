// ClientesTable.jsx — muestra el listado de clientes registrados.
// Por ahora es solamente de consulta para el administrador.

function ClientesTable({ clientes }) {
  if (clientes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
        No hay clientes registrados.
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

            <th className="px-4 py-3">
              Apellido
            </th>

            <th className="px-4 py-3">
              Email
            </th>

            <th className="px-4 py-3">
              Rol
            </th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((cliente) => (
            <tr
              key={cliente.id}
              className="border-t border-slate-800 hover:bg-slate-900/50"
            >
              <td className="px-4 py-3 font-medium text-white">
                {cliente.nombre}
              </td>

              <td className="px-4 py-3">
                {cliente.apellido}
              </td>

              <td className="px-4 py-3">
                {cliente.email}
              </td>

              <td className="px-4 py-3">
                <span className="rounded-full bg-indigo-950 px-2 py-1 text-xs text-indigo-300">
                  {cliente.rol}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientesTable;