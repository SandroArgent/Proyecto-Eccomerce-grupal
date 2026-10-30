// CategoriaForm.jsx — formulario de creación/edición de una categoría.
// Incluye el selector de categoría padre, para poder armar subcategorías
// (la relación recursiva que vimos en el DER).

import { useState } from 'react';

function CategoriaForm({ categoria, categorias, onGuardar, onCancelar, guardando, error }) {
  const esEdicion = Boolean(categoria?.id);

  const [form, setForm] = useState({
    nombre: categoria?.nombre || '',
    idCategoriaPadre: categoria?.idCategoriaPadre || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({
      ...form,
      idCategoriaPadre: form.idCategoriaPadre || null,
    });
  };

  // Una categoría no puede ser padre de sí misma: la sacamos de las opciones.
  const opcionesPadre = categorias.filter((c) => c.id !== categoria?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold text-white">
        {esEdicion ? `Editar: ${categoria.nombre}` : 'Nueva categoría'}
      </h2>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Nombre *</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Categoría padre</label>
        <select
          name="idCategoriaPadre"
          value={form.idCategoriaPadre}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Ninguna (categoría principal)</option>
          {opcionesPadre.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear categoría'}
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

export default CategoriaForm;
