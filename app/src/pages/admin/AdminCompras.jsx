import { useState, useEffect } from 'react';
import { obtenerTodasLasCompras } from '../../services/adminCompraService.js';
import ComprasTable from '../../components/admin/ComprasTable.jsx';

function AdminCompras() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState(''); 
  const [paginaActual, setPaginaActual] = useState(1);

  

  useEffect(() => {
    const cargarCompras = async () => {
      try {
        const data = await obtenerTodasLasCompras();
        setCompras(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las compras.');
      } finally {
        setCargando(false);
      }
    };

    cargarCompras();
  }, []);

  

    const pendientes = compras.filter(
      (c) => c.estadoEnvio === 'pendiente'
    ).length;

    const preparacion = compras.filter(
      (c) => c.estadoEnvio === 'preparacion'
    ).length;

    const enviadas = compras.filter(
      (c) => c.estadoEnvio === 'enviado'
    ).length;

    const entregadas = compras.filter(
      (c) => c.estadoEnvio === 'entregado'
    ).length;

    const canceladas = compras.filter(
      (c) => c.estadoEnvio === 'cancelado'
    ).length;

    const comprasFiltradas = compras.filter((compra) => {
      const coincideEstado =
    filtroEstado === 'todos' ||
    compra.estadoEnvio === filtroEstado;

  const coincideBusqueda =
    compra.Usuario?.nombre
      ?.toLowerCase()
      .includes(busqueda.toLowerCase());

  return coincideEstado && coincideBusqueda;
});


const comprasPorPagina = 10;

const indiceUltimaCompra =
  paginaActual * comprasPorPagina;

const indicePrimeraCompra =
  indiceUltimaCompra - comprasPorPagina;

const comprasPaginadas =
  comprasFiltradas.slice(
    indicePrimeraCompra,
    indiceUltimaCompra
  );

const totalPaginas = Math.ceil(
  comprasFiltradas.length / comprasPorPagina
);

useEffect(() => {
  setPaginaActual(1);
}, [filtroEstado, busqueda]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">
        Compras
      </h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-xl bg-yellow-950 p-4 text-center">
          <p className="text-sm text-yellow-300">
            Pendientes
          </p>
          <p className="text-2xl font-bold text-white">
            {pendientes}
          </p>
        </div>
        
        <div className="rounded-xl bg-blue-950 p-4 text-center">
          <p className="text-sm text-blue-300">
            Preparación
          </p>
          <p className="text-2xl font-bold text-white">
            {preparacion}
          </p>
        </div>
        
        <div className="rounded-xl bg-violet-950 p-4 text-center">
          <p className="text-sm text-violet-300">
            Enviadas
          </p>
          <p className="text-2xl font-bold text-white">
            {enviadas}
          </p>
        </div>
        
        <div className="rounded-xl bg-green-950 p-4 text-center">
          <p className="text-sm text-green-300">
            Entregadas
          </p>
          <p className="text-2xl font-bold text-white">
            {entregadas}
          </p>
        </div>
        
        <div className="rounded-xl bg-red-950 p-4 text-center">
          <p className="text-sm text-red-300">
            Canceladas
          </p>
          <p className="text-2xl font-bold text-white">
            {canceladas}
          </p>
        </div>
      </div>
      
      <select
        value={filtroEstado}
        onChange={(e) =>
          setFiltroEstado(e.target.value)
        }
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200"
      >
        <option value="todos">
          Todas las compras
        </option>
      
        <option value="pendiente">
          Pendientes
        </option>
      
        <option value="preparacion">
          En preparación
        </option>
      
        <option value="enviado">
          Enviadas
        </option>
      
        <option value="entregado">
          Entregadas
        </option>
      
        <option value="cancelado">
          Canceladas
        </option>
      </select>

      

      <input
        type="text"
        placeholder="Buscar cliente..."
        value={busqueda}
        onChange={(e) =>
          setBusqueda(e.target.value)
        }
        className="ml-3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200"
      />


      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {cargando ? (
        <p className="text-slate-400">
          Cargando compras...
        </p>
      ) :  (
        
        <ComprasTable compras={comprasPaginadas} />
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


export default AdminCompras;