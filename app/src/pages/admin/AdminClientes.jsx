// AdminClientes.jsx — listado de clientes registrados.
// Permite visualizar, buscar y paginar usuarios.

import { useState, useEffect, useCallback } from 'react';

import { obtenerUsuarios } from '../../services/usuarioService.js';

import ClientesTable from '../../components/admin/ClientesTable.jsx';

function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');

    try {
      const data = await obtenerUsuarios();

      // Nos quedamos únicamente con clientes.
      const clientesFiltrados =
        data.filter(
          (usuario) =>
            usuario.rol === 'cliente'
        );

      setClientes(clientesFiltrados);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        'No se pudieron cargar los clientes.'
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const clientesFiltrados =
    clientes.filter((cliente) =>
      `${cliente.nombre} ${cliente.apellido} ${cliente.email}`
        .toLowerCase()
        .includes(
          busqueda.toLowerCase()
        )
    );

  const clientesPorPagina = 10;

  const indiceUltimoCliente =
    paginaActual * clientesPorPagina;

  const indicePrimerCliente =
    indiceUltimoCliente -
    clientesPorPagina;

  const clientesPaginados =
    clientesFiltrados.slice(
      indicePrimerCliente,
      indiceUltimoCliente
    );

  const totalPaginas = Math.ceil(
    clientesFiltrados.length /
      clientesPorPagina
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">
        Clientes
      </h1>

      <input
        type="text"
        placeholder="Buscar cliente..."
        value={busqueda}
        onChange={(e) =>
          setBusqueda(e.target.value)
        }
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200"
      />

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {cargando ? (
        <p className="text-slate-400">
          Cargando clientes...
        </p>
      ) : (
        <ClientesTable
          clientes={clientesPaginados}
        />
      )}

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
          Página {paginaActual} de{' '}
          {totalPaginas || 1}
        </span>

        <button
          onClick={() =>
            setPaginaActual((prev) =>
              Math.min(
                prev + 1,
                totalPaginas
              )
            )
          }
          disabled={
            paginaActual === totalPaginas
          }
          className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

export default AdminClientes;