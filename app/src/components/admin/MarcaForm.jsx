import { useState } from 'react';

function MarcaForm({
  marca,
  onGuardar,
  onCancelar,
  guardando,
  error,
}) {
  const esEdicion = Boolean(marca?.id);

  const [nombre, setNombre] = useState(
    marca?.nombre || ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    onGuardar({
      nombre,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6"
    >
      <h2 className="text-lg font-semibold text-white">
        {esEdicion
          ? `Editar: ${marca.nombre}`
          : 'Nueva marca'}
      </h2>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Nombre *
        </label>

        <input
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {guardando
            ? 'Guardando...'
            : esEdicion
            ? 'Guardar cambios'
            : 'Crear marca'}
        </button>

        <button
          type="button"
          onClick={onCancelar}
          className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default MarcaForm;