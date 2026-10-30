// Inicio.jsx — Home de la tienda: banner + grilla de productos destacados.
// Pide a la API solo los productos con destacado=true (hasta 8), usando el
// mismo endpoint de catálogo que la página de Catálogo, con otro filtro.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerCatalogo } from '../services/catalogoService.js';
import { useCart } from '../context/CartContext.jsx';
import ProductoCard from '../components/catalogo/ProductoCard.jsx';

function Inicio() {
  const { agregarItem } = useCart();
  const [destacados, setDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const resultado = await obtenerCatalogo({ destacado: true, limit: 8 });
        setDestacados(resultado.productos);
      } catch (err) {
        console.error('Error al cargar destacados:', err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <div>
      {/* Banner simple. En un proyecto más grande esto sería un carrusel
          configurable desde el admin; acá alcanza con un hero estático. */}
      <section
  className="relative bg-slate-900 bg-cover bg-center px-6 py-20 text-center text-white"
  style={{ backgroundImage: "url('https://images.pexels.com/photos/7095505/pexels-photo-7095505.jpeg')" }}
>
        <h1 className="text-4xl font-bold">Encuentra el instrumento perfecto para tu estilo</h1>
        <p className="mt-3 text-slate-300">
          Guitarras, bajos, teclados y mucho más
        </p>
        <Link
          to="/catalogo"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
        >
          Explorar instrumentos
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Destacados</h2>

        {cargando ? (
          <p className="text-slate-500">Cargando...</p>
        ) : destacados.length === 0 ? (
          <p className="text-slate-500">Todavía no hay productos destacados cargados.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {destacados.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} onAgregarAlCarrito={agregarItem} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Inicio;
