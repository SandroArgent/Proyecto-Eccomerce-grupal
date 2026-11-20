// Perfil.jsx - Página protegida: solo se ve si hay sesión iniciada.
// Sirve como prueba de que RutaProtegida y AuthContext funcionan juntos.

import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  actualizarPerfilUsuario,
  verificarEmailPerfilUsuario,
} from '../services/authService.js';

function Perfil() {
  const { usuario, setUsuario, logout } = useAuth();

  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    email: usuario?.email || '',
  });

  const [guardando, setGuardando] =
    useState(false);

  const [mensaje, setMensaje] =
    useState('');

  const [error, setError] =
    useState('');

  // Si se cambió el email, hay que confirmar con el código que llegó al email nuevo.
  const [pendiente, setPendiente] = useState(false);
  const [codigo, setCodigo] = useState('');

    // Actualiza los campos del formulario mientras el usuario escribe.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Envía los cambios del perfil al backend.
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setMensaje('');
    setError('');
  
    try {
      setGuardando(true);
        

      const usuarioActualizado =
  await actualizarPerfilUsuario(form);

        // Cambió el email: todavía no se guardó nada, falta ingresar el código.
        if (usuarioActualizado?.pendiente) {
          setPendiente(true);
          setCodigo('');
          setMensaje(usuarioActualizado.mensaje);
          return;
        }

        setUsuario(usuarioActualizado);

        localStorage.setItem(
          'usuario',
          JSON.stringify(usuarioActualizado)
        );

        setMensaje(
          'Perfil actualizado correctamente.'
        );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

    } catch (err) {
      console.error(err);
    
      setError(
        err.message ||
          'No se pudo actualizar el perfil.'
      );
    } finally {
      setGuardando(false);
    }
  };

  // Confirma el código y recién ahí se guardan los cambios.
  const handleConfirmar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      setGuardando(true);
      const usuarioActualizado = await verificarEmailPerfilUsuario(codigo);

      setUsuario(usuarioActualizado);
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      setForm({
        nombre: usuarioActualizado.nombre || '',
        apellido: usuarioActualizado.apellido || '',
        email: usuarioActualizado.email || '',
      });
      setPendiente(false);
      setCodigo('');
      setMensaje('Perfil actualizado correctamente.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'No se pudo confirmar el código.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className=" mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-3xl font-bold text-slate-900">Mi perfil</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {mensaje && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {mensaje}
          </div>
        )}
      
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nombre
          </label>
      
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
      
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Apellido
          </label>
      
          <input
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
      
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
      
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
      
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Rol
          </label>
      
          <input
            value={usuario?.rol || ''}
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-500"
          />
        </div>
      
        <button
          type="submit"
          disabled={guardando}
          className="w-full rounded-xl bg-indigo-700 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {guardando
            ? 'Guardando...'
            : 'Guardar cambios'}
        </button>
      </form>

      {pendiente && (
        <form
          onSubmit={handleConfirmar}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm text-slate-600">
            Ingresá el código que te enviamos a {form.email} para confirmar el cambio.
          </p>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            maxLength={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-xl tracking-widest text-slate-900"
          />
          <button
            type="submit"
            disabled={guardando || codigo.length !== 6}
            className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {guardando ? 'Confirmando...' : 'Confirmar email'}
          </button>
          <p className="text-center text-xs text-slate-500">
            ¿No llegó? Tocá "Guardar cambios" de nuevo para recibir otro código.
          </p>
        </form>
      )}

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
