// RestablecerClave.jsx — PASO 2 de la recuperación: el usuario llega desde
// el enlace del mail (/restablecer-clave?token=...) y elige su contraseña nueva.

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { restablecerClaveConToken } from '../services/authService.js';

function RestablecerClave() {
  // useSearchParams lee lo que viene después del "?" en la URL.
  // Acá nos interesa el parámetro "token".
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [contraseña, setContraseña] = useState('');
  const [repetir, setRepetir] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (contraseña !== repetir) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setEnviando(true);
      await restablecerClaveConToken(token, contraseña);
      setListo(true);
    } catch (err) {
      console.error('Error al restablecer la contraseña:', err);
      setError(err.message || 'No se pudo restablecer la contraseña.');
    } finally {
      setEnviando(false);
    }
  };

  // Si alguien entra a /restablecer-clave sin el ?token=... del mail.
  if (!token) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Enlace inválido</h1>
        <p className="text-sm text-slate-600">
          Este enlace no es válido. Pedí uno nuevo desde la pantalla de recuperación.
        </p>
        <Link to="/olvide-clave" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Pedir un enlace nuevo
        </Link>
      </div>
    );
  }

  if (listo) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6 text-center">
        <h1 className="text-2xl font-bold text-green-700">¡Contraseña actualizada!</h1>
        <p className="text-sm text-slate-600">Ya podés iniciar sesión con tu contraseña nueva.</p>
        <Link
          to="/login"
          className="inline-block rounded-xl bg-indigo-600 px-6 py-2.5 font-medium text-white hover:bg-indigo-500"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Nueva contraseña</h1>
        <p className="mt-2 text-sm text-slate-600">Elegí una contraseña nueva para tu cuenta.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}{' '}
          <Link to="/olvide-clave" className="font-semibold underline">
            Pedir un enlace nuevo
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña nueva</label>
          <input
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Repetí la contraseña</label>
          <input
            type="password"
            value={repetir}
            onChange={(e) => setRepetir(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-center font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {enviando ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  );
}

export default RestablecerClave;
