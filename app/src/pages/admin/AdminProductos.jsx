// AdminProductos.jsx — el "cerebro" de la sección de productos del panel.
// Mismo patrón que vimos en el CrudPanel.jsx del ejemplo del profe: este
// componente maneja los datos (estado + llamadas a la API) y decide qué
// mostrar; la tabla y el formulario son componentes "tontos" que solo
// reciben props.

import { useState, useEffect, useCallback } from 'react';
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../../services/productoService.js';
import { obtenerCategorias } from '../../services/categoriaService.js';
import ProductosTable from '../../components/admin/ProductosTable.jsx';
import ProductoForm from '../../components/admin/ProductoForm.jsx';

function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // null = mostrando la tabla. {} = formulario de alta. {...} = formulario de edición.
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  // Mensaje de éxito temporal ("Producto creado", "Producto eliminado"),
  // es el "feedback visual" que pide la consigna.
  const [mensajeExito, setMensajeExito] = useState('');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [productosData, categoriasData] = await Promise.all([
        obtenerProductos(),
        obtenerCategorias(),
      ]);
      setProductos(productosData);
      setCategorias(categoriasData);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError(err.message || 'No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // El mensaje de éxito desaparece solo a los 3 segundos.
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
        await actualizarProducto(editando.id, datos);
        setMensajeExito('Producto actualizado correctamente.');
      } else {
        await crearProducto(datos);
        setMensajeExito('Producto creado correctamente.');
      }
      setEditando(null);
      await cargarDatos();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setErrorForm(err.message || 'No se pudo guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (producto) => {
    const confirmar = window.confirm(`¿Seguro que querés eliminar "${producto.nombre}"?`);
    if (!confirmar) return;

    try {
      await eliminarProducto(producto.id);
      setMensajeExito('Producto eliminado correctamente.');
      await cargarDatos();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError(err.message || 'No se pudo eliminar el producto.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-white">Productos</h1>
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
        <ProductoForm
          producto={editando}
          categorias={categorias}
          onGuardar={handleGuardar}
          onCancelar={() => { setEditando(null); setErrorForm(''); }}
          guardando={guardando}
          error={errorForm}
        />
      ) : cargando ? (
        <p className="text-slate-400">Cargando productos...</p>
      ) : (
        <ProductosTable
          productos={productos}
          categorias={categorias}
          onEditar={setEditando}
          onEliminar={handleEliminar}
        />
      )}
    </div>
  );
}

export default AdminProductos;
