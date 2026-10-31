// OlvideClave.jsx — PASO 1 de la recuperación: el usuario escribe su email
// y el backend le manda un mail con un enlace.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { solicitarRecuperacionClave } from '../services/authService.js';

function OlvideClave() {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeOk, setMensajeOk] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeOk('');

    try {
      setEnviando(true);
      const respuesta = await solicitarRecuperacionClave(email);
      // El backend responde lo mismo exista o no el email (por seguridad),
      // así que acá mostramos siempre ese mismo mensaje.
      setMensajeOk(respuesta.mensaje);
    } catch (err) {
      console.error('Error al pedir la recuperación:', err);
      setError(err.message || 'No se pudo procesar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-slate-600">
          Escribí el email con el que te registraste y te enviamos un enlace para elegir una contraseña nueva.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {mensajeOk && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {mensajeOk}
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

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-center font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviarme el enlace'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}

export default OlvideClave;
