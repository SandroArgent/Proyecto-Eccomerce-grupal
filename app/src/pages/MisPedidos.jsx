// MisPedidos.jsx — historial de compras del usuario logueado.
// Versión preliminar: la consigna marca esta pantalla como algo a definir
// mejor en clase con Pablo, así que esto es lo mínimo funcional (lista con
// fecha, total y los productos de cada compra) para tener algo que mostrar,
// no la versión final con filtros/estados de envío, etc.

import { useState, useEffect } from 'react';
import { obtenerMisCompras } from '../services/ordenService.js';

function MisPedidos() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerMisCompras()
      .then(setCompras)
      .catch((err) => console.error('Error al cargar pedidos:', err))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="p-8 text-center text-slate-500">Cargando...</p>;

  if (compras.length === 0) {
    return <p className="p-8 text-center text-slate-500">Todavía no hiciste ninguna compra.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Mis pedidos</h1>

      <div className="space-y-4">
        {compras.map((compra) => (
          <div key={compra.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">Pedido #{compra.id}</p>
              <p className="text-sm text-slate-500">{new Date(compra.fecha).toLocaleDateString('es-AR')}</p>
            </div>
            <p className="text-sm text-slate-500">Estado: {compra.estadoPago}</p>

            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {compra.CompraProductos?.map((item) => (
                <li key={item.id}>
                  {item.cantidad} × {item.Producto?.nombre} — ${Number(item.subTotal).toLocaleString('es-AR')}
                </li>
              ))}
            </ul>

            <p className="mt-2 text-right font-bold text-slate-900">
              Total: ${Number(compra.total).toLocaleString('es-AR')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MisPedidos;
