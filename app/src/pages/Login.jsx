// Login.jsx - Página de inicio de sesión.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !contraseña) {
      setError('Por favor completá todos los campos.');
      return;
    }

    try {
      setEnviando(true);
      await login(email, contraseña);
      navigate('/');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.message || 'Error al iniciar sesión. Verificá tus credenciales.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ingresá con tu cuenta para ver tu perfil y tus compras.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="tu@email.com"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
          <input
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-center font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {enviando ? 'Iniciando sesión...' : 'Ingresar'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        ¿No tenés cuenta?{' '}
        <Link to="/registro" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Registrate acá
        </Link>
      </p>
    </div>
  );
}

export default Login;
