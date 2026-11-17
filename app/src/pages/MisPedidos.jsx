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


  const claseEstadoEnvio = (estado) => {
  switch (estado) {
    case "pendiente":
      return "bg-yellow-100 text-yellow-800";

    case "preparacion":
      return "bg-blue-100 text-blue-800";

    case "enviado":
      return "bg-violet-100 text-violet-800";

    case "entregado":
      return "bg-green-100 text-green-800";

    case "cancelado":
      return "bg-red-100 text-red-800";

    default:
      return "bg-slate-100 text-slate-800";
  }
};

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
            <p className="text-sm text-slate-500">Estado de pago: {compra.estadoPago}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-slate-500">
                Estado de envío:
              </span>
                    
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${claseEstadoEnvio(
                  compra.estadoEnvio
                )}`}
              >
                {compra.estadoEnvio}
              </span>
            </div>

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
