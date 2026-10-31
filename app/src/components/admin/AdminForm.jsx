import { useState } from "react";

function AdminForm({ admin, onGuardar, onCancelar, guardando, error }) {
  const esEdicion = Boolean(admin?.id);

  const [form, setForm] = useState({
    nombre: admin?.nombre || "",
    email: admin?.email || "",
    contraseña: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6"
    >
      <h2 className="text-lg font-semibold text-white">
        {esEdicion ? `Editar: ${admin.nombre}` : "Nuevo administrador"}
      </h2>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Nombre *
          </label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Contraseña
          </label>
          <input
            type="password"
            name="contraseña"
            value={form.contraseña}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {guardando
            ? "Guardando..."
            : esEdicion
            ? "Guardar cambios"
            : "Crear administrador"}
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

export default AdminForm;