import { useState } from "react";
import { actualizarEstadoCompra } from "../../services/adminCompraService.js";


function ComprasTable({ compras }) {

    const [compraAbierta, setCompraAbierta] = useState(null);

    const claseEstado = (estado) => {
  switch (estado?.toLowerCase()) {
    case "pendiente":
      return "bg-yellow-950 text-yellow-300 border border-yellow-800";

    case "preparacion":
      return "bg-blue-950 text-blue-300 border border-blue-800";

    case "enviado":
      return "bg-violet-950 text-violet-300 border border-violet-800";

    case "entregado":
      return "bg-green-950 text-green-300 border border-green-800";

    case "cancelado":
      return "bg-red-950 text-red-300 border border-red-800";

    default:
      return "bg-slate-800 text-slate-300 border border-slate-700";
  }
};


  if (compras.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
        No hay compras registradas.
      </div>
    );
  }


  const handleCambioEstado = async (
  id,
  nuevoEstado
) => {
  try {
    await actualizarEstadoCompra(
      id,
      nuevoEstado
    );

    window.location.reload();
  } catch (error) {
    console.error(error);

    alert(
      "No se pudo actualizar el estado"
    );
  }
};


  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">Pedido</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3">Estado Pago</th>
            <th className="px-4 py-3">Estado Envío</th>
            <th className="px-4 py-3 text-center">Productos</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {compras.map((compra) => (
            <>
            <tr
              key={compra.id}
              className="border-t border-slate-800 hover:bg-slate-900/50"
            >
                
                
              <td className="px-4 py-3">
                #{compra.id}
                
              </td>

              <td className="px-4 py-3 text-white">
                {compra.Usuario?.nombre}
              </td>

              <td className="px-4 py-3">
                {new Date(compra.fecha).toLocaleDateString("es-AR")}
              </td>

              <td className="px-4 py-3 text-right">
                $
                {Number(compra.total).toLocaleString("es-AR")}
              </td>

              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${claseEstado(
                    compra.estadoPago
                  )}`}
                >
                  {compra.estadoPago}
                </span>
              </td>

              <td className="px-4 py-3">
  <select
    value={compra.estadoEnvio}
    onChange={(e) =>
      handleCambioEstado(
        compra.id,
        e.target.value
      )
    }
    className={`rounded-lg px-2 py-1 text-xs font-medium ${claseEstado(
      compra.estadoEnvio
    )}`}
  >
    <option value="pendiente">
      Pendiente
    </option>

    <option value="preparacion">
      Preparación
    </option>

    <option value="enviado">
      Enviado
    </option>

    <option value="entregado">
      Entregado
    </option>

    <option value="cancelado">
      Cancelado
    </option>
  </select>
</td>

              <td className="px-4 py-3 text-center">
                {compra.CompraProductos?.length || 0}
              </td>

              <td className="px-4 py-3 text-center">
                <button
                  onClick={() =>
                    setCompraAbierta(
                      compraAbierta === compra.id ? null : compra.id
                    )
                  }
                  className="rounded-lg border border-slate-600 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
                >
                  {compraAbierta === compra.id
                    ? "Ocultar detalle"
                    : "Ver detalle"}
                </button>
                
              </td>
              
            </tr>

      {compraAbierta === compra.id && (
                  <tr>
                    <td
                      colSpan="8"
                      className="bg-slate-950 px-6 py-4"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-slate-300">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="py-2 text-left">
                                Producto
                              </th>

                              <th className="py-2 text-center">
                                Cantidad
                              </th>

                              <th className="py-2 text-right">
                                Precio unitario
                              </th>

                              <th className="py-2 text-right">
                                Subtotal
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {compra.CompraProductos?.map((item) => (
                              <tr
                                key={item.id}
                                className="border-b border-slate-800"
                              >
                                <td className="py-2">
                                  {item.Producto?.nombre}
                                </td>
                            
                                <td className="py-2 text-center">
                                  {item.cantidad}
                                </td>
                            
                                <td className="py-2 text-right">
                                  $
                                  {Number(item.precioUnitario).toLocaleString(
                                    "es-AR"
                                  )}
                                </td>
                              
                                <td className="py-2 text-right font-medium">
                                  $
                                  {Number(item.subTotal).toLocaleString(
                                    "es-AR"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        
                          <tfoot>
                            <tr>
                              <td
                                colSpan="3"
                                className="pt-3 text-right font-semibold"
                              >
                                Total:
                              </td>
                        
                              <td className="pt-3 text-right font-bold text-white">
                                $
                                {Number(compra.total).toLocaleString(
                                  "es-AR"
                                )}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}

            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ComprasTable;