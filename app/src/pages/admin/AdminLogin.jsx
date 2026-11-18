// AdminLogin.jsx — login exclusivo para administradores.
// Le pega a /api/auth/admin/login (no a /api/auth/usuario/login).

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();

   // Sesión de usuario cliente (la de la tienda)
  const {
    isAuthenticated: hayUsuario,
    usuario,
    logout: cerrarSesionUsuario,
    cargando: cargandoUsuario,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !contraseña) {
      setError('Completá email y contraseña.');
      return;
    }

    try {
      setEnviando(true);
      await login(email, contraseña);
      navigate('/admin/productos');
    } catch (err) {
      console.error('Error al iniciar sesión como admin:', err);
      setError(err.message || 'Credenciales inválidas.');
    } finally {
      setEnviando(false);
    }
  };


    if (cargandoUsuario) return null;

  // Si hay sesión de usuario, primero hay que cerrarla.
  if (hayUsuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-700 bg-slate-800 p-6 text-center">
          <h1 className="text-xl font-bold text-white">Ya tenés una sesión de usuario</h1>
          <p className="text-sm text-slate-400">
            Estás conectado como {usuario?.email}. Cerrá esa sesión para ingresar como administrador.
          </p>
          <button
            type="button"
            onClick={cerrarSesionUsuario}
            className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-500"
          >
            Cerrar sesión de usuario
          </button>
          <Link to="/" className="block text-sm text-slate-400 hover:text-white">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Panel de administración</h1>
          <p className="mt-2 text-sm text-slate-400">Acceso exclusivo para administradores</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Contraseña</label>
            <input
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-center font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
