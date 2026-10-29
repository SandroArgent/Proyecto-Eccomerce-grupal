// AdminCategorias.jsx — mismo patrón que AdminProductos.jsx, pero para
// categorías. Al ser una entidad más chica (solo nombre + padre opcional),
// el componente es más corto.

import { useState, useEffect, useCallback } from 'react';
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '../../services/categoriaService.js';
import CategoriasTable from '../../components/admin/CategoriasTable.jsx';
import CategoriaForm from '../../components/admin/CategoriaForm.jsx';

function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError(err.message || 'No se pudieron cargar las categorías.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (!mensajeExito) return;
    const timer = setTimeout(() => setMensajeExito(''), 3000);
    return () => clearTimeout(timer);
  }, [mensajeExito]);

  const handleGuardar = async (datos) => {
    setGuardando(true);
    setErrorForm('');
    try {
      if (editando?.id) {
        await actualizarCategoria(editando.id, datos);
        setMensajeExito('Categoría actualizada correctamente.');
      } else {
        await crearCategoria(datos);
        setMensajeExito('Categoría creada correctamente.');
      }
      setEditando(null);
      await cargarDatos();
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      setErrorForm(err.message || 'No se pudo guardar la categoría.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (categoria) => {
    const confirmar = window.confirm(`¿Seguro que querés eliminar "${categoria.nombre}"?`);
    if (!confirmar) return;

    try {
      await eliminarCategoria(categoria.id);
      setMensajeExito('Categoría eliminada correctamente.');
      await cargarDatos();
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      // Si la categoría tiene productos asociados, el backend puede
      // rechazar el borrado por la foreign key. Mostramos el mensaje tal
      // cual venga del servidor.
      setError(err.message || 'No se pudo eliminar la categoría.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-white">Categorías</h1>
        {editando === null && (
          <button
            onClick={() => setEditando({})}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            +
          </button>
        )}
      </div>

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
        <CategoriaForm
          categoria={editando}
          categorias={categorias}
          onGuardar={handleGuardar}
          onCancelar={() => { setEditando(null); setErrorForm(''); }}
          guardando={guardando}
          error={errorForm}
        />
      ) : cargando ? (
        <p className="text-slate-400">Cargando categorías...</p>
      ) : (
        <CategoriasTable
          categorias={categorias}
          onEditar={setEditando}
          onEliminar={handleEliminar}
        />
      )}
    </div>
  );
}

export default AdminCategorias;
