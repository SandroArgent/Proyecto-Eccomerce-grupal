// CartContext.jsx — estado global del carrito de compras.
// A diferencia de AuthContext/AdminAuthContext, este no habla con el
// backend para nada mientras el usuario arma su carrito: todo vive en
// React state + localStorage. El backend recién se entera cuando el
// usuario confirma la compra en el Checkout (ordenService.crearCompra).

import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext(null);
const CARRITO_KEY = 'carrito';

export function CartProvider({ children }) {
  // Leemos el carrito guardado una sola vez, al montar, como estado inicial.
  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem(CARRITO_KEY);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  // Cada vez que cambian los items, los volvemos a guardar. Así el
  // carrito sobrevive a un F5 o a cerrar y volver a abrir el navegador.
  useEffect(() => {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(items));
  }, [items]);

  const agregarItem = (producto, cantidad = 1) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.idProducto === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.idProducto === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i
        );
      }
      return [
        ...prev,
        {
          idProducto: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          imagen: producto.imagen,
          cantidad,
        },
      ];
    });
  };

  const quitarItem = (idProducto) => {
    setItems((prev) => prev.filter((i) => i.idProducto !== idProducto));
  };

  const actualizarCantidad = (idProducto, cantidad) => {
    if (cantidad <= 0) {
      quitarItem(idProducto);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.idProducto === idProducto ? { ...i, cantidad } : i))
    );
  };

  const vaciarCarrito = () => setItems([]);

  // useMemo evita recalcular esto en cada render si "items" no cambió.
  const cantidadTotal = useMemo(
    () => items.reduce((acc, i) => acc + i.cantidad, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    [items]
  );

  const value = {
    items,
    agregarItem,
    quitarItem,
    actualizarCantidad,
    vaciarCarrito,
    cantidadTotal,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
