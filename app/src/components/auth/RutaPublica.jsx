// RutaPublica.jsx envuelve páginas que solo tienen sentido SIN sesión
// (login, registro). Si ya hay sesión iniciada, redirige al inicio.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function RutaPublica({ children }) {
  const { isAuthenticated, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm font-medium text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RutaPublica;