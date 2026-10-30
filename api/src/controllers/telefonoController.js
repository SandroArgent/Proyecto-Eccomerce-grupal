import { Telefono } from '../models/index.js';

export const getTelefonos = async (req, res) => {
  const telefonos = await Telefono.findAll();
  res.json(telefonos);
};

export const getTelefonoPorId = async (req, res) => {
  const telefono = await Telefono.findByPk(req.params.id);
  if (!telefono) return res.status(404).json({ mensaje: 'Telefono no encontrado' });
  res.json(telefono);
};

export const crearTelefono = async (req, res) => {
  const nuevoTelefono = await Telefono.create(req.body);
  res.status(201).json(nuevoTelefono);
};

export const actualizarTelefono = async (req, res) => {
  const telefono = await Telefono.findByPk(req.params.id);
  if (!telefono) return res.status(404).json({ mensaje: 'Telefono no encontrado' });
  await telefono.update(req.body);
  res.json(telefono);
};

export const eliminarTelefono = async (req, res) => {
  const telefono = await Telefono.findByPk(req.params.id);
  if (!telefono) return res.status(404).json({ mensaje: 'Telefono no encontrado' });
  await telefono.destroy();
  res.json({ mensaje: 'Telefono eliminado' });
};