import { Domicilio } from '../models/index.js';

export const getDomicilios = async (req, res) => {
  const domicilios = await Domicilio.findAll();
  res.json(domicilios);
};

export const getDomicilioPorId = async (req, res) => {
  const domicilio = await Domicilio.findByPk(req.params.id);
  if (!domicilio) return res.status(404).json({ mensaje: 'Domicilio no encontrado' });
  res.json(domicilio);
};

export const crearDomicilio = async (req, res) => {
  const nuevoDomicilio = await Domicilio.create(req.body);
  res.status(201).json(nuevoDomicilio);
};

export const actualizarDomicilio = async (req, res) => {
  const domicilio = await Domicilio.findByPk(req.params.id);
  if (!domicilio) return res.status(404).json({ mensaje: 'Domicilio no encontrado' });
  await domicilio.update(req.body);
  res.json(domicilio);
};

export const eliminarDomicilio = async (req, res) => {
  const domicilio = await Domicilio.findByPk(req.params.id);
  if (!domicilio) return res.status(404).json({ mensaje: 'Domicilio no encontrado' });
  await domicilio.destroy();
  res.json({ mensaje: 'Domicilio eliminado' });
};