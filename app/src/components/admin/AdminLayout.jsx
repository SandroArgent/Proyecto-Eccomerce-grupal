// AdminLayout.jsx — layout compartido por todas las páginas del panel de
// admin: sidebar de navegación + área de contenido (<Outlet />, donde
// React Router inyecta la página elegida: productos o categorías).

import { NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

function AdminLayout() {
  const { administrador, logout } = useAdminAuth();

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
    }`;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="w-56 shrink-0 border-r border-slate-800 bg-slate-900 p-4">
        <div className="mb-6 px-2">
          <p className="text-sm font-semibold text-white">Panel de admin</p>
          <p className="truncate text-xs text-slate-500">{administrador?.email}</p>

          <button
          onClick={logout}
          className="mt-6 w-full rounded-lg border border-slate-700 px-4 py-2 text-left text-sm font-medium text-slate-300 hover:bg-slate-800"
        >
          Cerrar sesión
        </button>
        
        </div>

         

        <nav className="space-y-1 p-2">
          <NavLink to="/admin/productos" className={linkClass}>Productos</NavLink>
          <NavLink to="/admin/categorias" className={linkClass}>Categorías</NavLink>
           <NavLink to="/admin/compras" className={linkClass}>compras</NavLink>
        </nav>

       
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
