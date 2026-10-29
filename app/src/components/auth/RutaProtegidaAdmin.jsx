// RutaProtegidaAdmin.jsx — igual que RutaProtegida.jsx, pero chequea la
// sesión de administrador en vez de la de usuario cliente.

import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

function RutaProtegidaAdmin({ children }) {
  const { isAdminAuthenticated, cargando } = useAdminAuth();

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm font-medium text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default RutaProtegidaAdmin;
