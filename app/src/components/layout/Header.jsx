// Header.jsx - Cabecera de la tienda: navegación, carrito y sesión.

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

function Header() {
  const { usuario, isAuthenticated, logout } = useAuth();
  const { cantidadTotal } = useCart();

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="text-xl font-black tracking-wider text-slate-900">
  SONORA<span className="text-indigo-600">MUSIC</span>
</NavLink>

        <nav className="flex items-center gap-2">
          <NavLink to="/" end className={linkClass}>Inicio</NavLink>
          <NavLink to="/catalogo" className={linkClass}>Catálogo</NavLink>

          {isAuthenticated && (
            <NavLink to="/pedidos" className={linkClass}>Mis pedidos</NavLink>
          )}

          <NavLink to="/carrito" className="relative rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Carrito
            {cantidadTotal > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {cantidadTotal}
              </span>
            )}
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/perfil" className={linkClass}>
                Hola, {usuario?.nombre}
              </NavLink>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Ingresar</NavLink>
              <NavLink to="/registro" className={linkClass}>Registrarse</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
