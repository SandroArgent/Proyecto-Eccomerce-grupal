// RutaProtegidaAdmin.jsx — igual que RutaProtegida.jsx, pero chequea la
// sesión de administrador en vez de la de usuario cliente.
// Además no deja entrar al panel si hay una sesión de usuario iniciada:
// manda a /admin/login, que pide cerrarla primero.

import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function RutaProtegidaAdmin({ children }) {
  const { isAdminAuthenticated, cargando } = useAdminAuth();
  const { isAuthenticated: hayUsuario, cargando: cargandoUsuario } = useAuth();

  if (cargando || cargandoUsuario) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm font-medium text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!isAdminAuthenticated || hayUsuario) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default RutaProtegidaAdmin;