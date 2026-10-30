// Checkout.jsx — confirmación de la compra: manda el carrito al backend
// (POST /compras), que es quien de verdad valida el stock y hace el
// descuento dentro de una transacción. Si algo sale mal (por ejemplo, se
// agotó el stock de algo entre que lo agregaste al carrito y pagaste),
// el error vuelve acá y el carrito NO se vacía, para que puedas corregir.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { crearCompra } from '../services/ordenService.js';

function Checkout() {
  const { items, subtotal, vaciarCarrito } = useCart();
  const navigate = useNavigate();

  const [medioPago, setMedioPago] = useState('efectivo');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [confirmado, setConfirmado] = useState(null);

  const handleConfirmar = async () => {
    setEnviando(true);
    setError('');
    try {
      const datos = {
        items: items.map((i) => ({ idProducto: i.idProducto, cantidad: i.cantidad })),
        medioPago,
      };
      const compra = await crearCompra(datos);
      setConfirmado(compra);
      vaciarCarrito();
    } catch (err) {
      console.error('Error al confirmar la compra:', err);
      setError(err.message || 'No se pudo confirmar la compra.');
    } finally {
      setEnviando(false);
    }
  };

  if (confirmado) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-green-700">¡Compra confirmada!</h1>
        <p className="mt-2 text-slate-600">
          Pedido #{confirmado.id} por ${Number(confirmado.total).toLocaleString('es-AR')}
        </p>
        <button
          onClick={() => navigate('/pedidos')}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
        >
          Ver mis pedidos
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center text-slate-500">
        No tenés productos en el carrito.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Checkout</h1>

      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        {items.map((item) => (
          <div key={item.idProducto} className="flex justify-between text-sm">
            <span>{item.nombre} × {item.cantidad}</span>
            <span>${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold">
          <span>Total</span>
          <span>${subtotal.toLocaleString('es-AR')}</span>
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-1 block text-sm font-medium text-slate-700">Medio de pago</label>
        <select
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="efectivo">Mercado Pago</option>
          
        </select>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleConfirmar}
        disabled={enviando}
        className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        {enviando ? 'Confirmando...' : 'Confirmar compra'}
      </button>
    </div>
  );
}

export default Checkout;
