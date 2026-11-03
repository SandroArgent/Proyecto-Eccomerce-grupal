import { useState, useEffect, useCallback } from 'react';

import {
  obtenerMarcas,
  crearMarca,
  actualizarMarca,
  eliminarMarca,
} from '../../services/marcaService.js';

import MarcaForm from '../../components/admin/MarcaForm.jsx';
import MarcasTable from '../../components/admin/MarcasTable.jsx';

function AdminMarcas() {
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');

    try {
      const data = await obtenerMarcas();
      setMarcas(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          'No se pudieron cargar las marcas.'
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (!mensajeExito) return;

    const timer = setTimeout(
      () => setMensajeExito(''),
      3000
    );

    return () => clearTimeout(timer);
  }, [mensajeExito]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const marcasFiltradas = marcas.filter(
    (marca) =>
      marca.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase())
  );

  const marcasPorPagina = 10;

  const indiceUltimaMarca =
    paginaActual * marcasPorPagina;

  const indicePrimeraMarca =
    indiceUltimaMarca - marcasPorPagina;

  const marcasPaginadas =
    marcasFiltradas.slice(
      indicePrimeraMarca,
      indiceUltimaMarca
    );

  const totalPaginas = Math.ceil(
    marcasFiltradas.length /
      marcasPorPagina
  );

  const handleGuardar = async (datos) => {
    setGuardando(true);
    setErrorForm('');

    try {
      if (editando?.id) {
        await actualizarMarca(
          editando.id,
          datos
        );

        setMensajeExito(
          'Marca actualizada correctamente.'
        );
      } else {
        await crearMarca(datos);

        setMensajeExito(
          'Marca creada correctamente.'
        );
      }

      setEditando(null);

      await cargarDatos();
    } catch (err) {
      console.error(err);

      setErrorForm(
        err.message ||
          'No se pudo guardar la marca.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (marca) => {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar "${marca.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await eliminarMarca(marca.id);

      setMensajeExito(
        'Marca eliminada correctamente.'
      );

      await cargarDatos();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          'No se pudo eliminar la marca.'
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-white">
          Marcas
        </h1>

        {editando === null && (
          <button
            onClick={() => setEditando({})}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            +
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Buscar marca..."
        value={busqueda}
        onChange={(e) =>
          setBusqueda(e.target.value)
        }
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200"
      />

      {mensajeExito && (
        <div className="rounded-lg border border-green-800 bg-green-950 p-3 text-sm text-green-300">
          {mensajeExito}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {editando !== null ? (
        <MarcaForm
          marca={editando}
          onGuardar={handleGuardar}
          onCancelar={() => {
            setEditando(null);
            setErrorForm('');
          }}
          guardando={guardando}
          error={errorForm}
        />
      ) : cargando ? (
        <p className="text-slate-400">
          Cargando marcas...
        </p>
      ) : (
        <MarcasTable
          marcas={marcasPaginadas}
          onEditar={setEditando}
          onEliminar={handleEliminar}
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

export default AdminMarcas;