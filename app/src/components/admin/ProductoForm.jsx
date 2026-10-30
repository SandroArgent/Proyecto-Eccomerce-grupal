// ProductoForm.jsx — formulario de creación/edición de un producto.
// Sirve para ambos casos: si "producto" viene con id, es una edición;
// si viene vacío ({}), es un alta nueva. El feedback visual (mensajes de
// error, botón deshabilitado mientras guarda) lo maneja este componente.

import { useState } from 'react';

function ProductoForm({ producto, categorias, onGuardar, onCancelar, guardando, error }) {
  const esEdicion = Boolean(producto?.id);

  const [form, setForm] = useState({
    nombre: producto?.nombre || '',
    descripcion: producto?.descripcion || '',
    precio: producto?.precio ?? '',
    stock: producto?.stock ?? '',
    marca: producto?.marca || '',
    imagen: producto?.imagen || '',
    destacado: producto?.destacado || false,
    idCategoria: producto?.idCategoria || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convertimos precio/stock a número y mandamos idCategoria como
    // null si no se eligió ninguna, para no romper la foreign key.
    onGuardar({
      ...form,
      precio: Number(form.precio),
      stock: Number(form.stock),
      idCategoria: form.idCategoria || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold text-white">
        {esEdicion ? `Editar: ${producto.nombre}` : 'Nuevo producto'}
      </h2>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-300">Nombre *</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-300">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Precio *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Stock *</label>
          <input
            type="number"
            step="1"
            min="0"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div>
  <label className="mb-1 block text-sm font-medium text-slate-300">
    Marca
  </label>
  <select
    name="marca"
    value={form.marca}
    onChange={handleChange}
    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
  >
    <option value="">Selecciona una marca</option>
    <option value="Yamaha">Yamaha</option>
    <option value="Fender">Fender</option>
    <option value="Gibson">Gibson</option>
    <option value="Roland">Roland</option>
    <option value="Casio">Casio</option>
    <option value="Tama">Tama</option>
    <option value="Pearl">Pearl</option>
    <option value="Cremona">Cremona</option>
    <option value="Ernie Ball">Ernie Ball</option>
    <option value="DAddario">Daddario</option>
    <option value="Dunlop">Dunlop</option>
    <option value="Shure">Shure</option>
    <option value="Audio-Technica">Audio-Technica</option>
    <option value="Boss">Boss</option>
    <option value="Hercules">Hercules</option>
    <option value="Vic Firth">Vic Firth</option>
  </select>
</div>


        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Categoría</label>
          <select
            name="idCategoria"
            value={form.idCategoria}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-300">Imagen (URL)</label>
          <input
            name="imagen"
            value={form.imagen}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="destacado"
            name="destacado"
            checked={form.destacado}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-600 bg-slate-800"
          />
          <label htmlFor="destacado" className="text-sm text-slate-300">Producto destacado</label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
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

export default ProductoForm;
