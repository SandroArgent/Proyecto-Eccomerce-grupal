// Perfil.jsx - Página protegida: solo se ve si hay sesión iniciada.
// Sirve como prueba de que RutaProtegida y AuthContext funcionan juntos.

import { useAuth } from '../context/AuthContext.jsx';

function Perfil() {
  const { usuario, logout } = useAuth();

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-3xl font-bold text-slate-900">Mi perfil</h1>

      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p><strong>Nombre:</strong> {usuario?.nombre} {usuario?.apellido}</p>
        <p><strong>Email:</strong> {usuario?.email}</p>
        <p><strong>Rol:</strong> {usuario?.rol}</p>
      </div>

      <button
        onClick={logout}
        className="w-full rounded-xl border border-slate-200 py-2.5 text-center font-medium text-slate-700 transition hover:bg-slate-100"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export default Perfil;
