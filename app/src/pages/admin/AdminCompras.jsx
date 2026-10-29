import { useState, useEffect } from 'react';
import { obtenerTodasLasCompras } from '../../services/adminCompraService.js';
import ComprasTable from '../../components/admin/ComprasTable.jsx';

function AdminCompras() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">
        Compras
      </h1>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {cargando ? (
        <p className="text-slate-400">
          Cargando compras...
        </p>
      ) : (
        <ComprasTable compras={compras} />
      )}
    </div>
  );
}

export default AdminCompras;