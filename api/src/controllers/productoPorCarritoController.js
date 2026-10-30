import { ProductoPorCarrito } from '../models/index.js';

export const getProductoPorCarritos = async (req, res) => {
  const registros = await ProductoPorCarrito.findAll();
  res.json(registros);
};

export const getProductoPorCarritoPorId = async (req, res) => {
  const registro = await ProductoPorCarrito.findByPk(req.params.id);
  if (!registro) return res.status(404).json({ mensaje: 'ProductoPorCarrito no encontrado' });
  res.json(registro);
};

export const crearProductoPorCarrito = async (req, res) => {
  const nuevoRegistro = await ProductoPorCarrito.create(req.body);
  res.status(201).json(nuevoRegistro);
};

export const actualizarProductoPorCarrito = async (req, res) => {
  const registro = await ProductoPorCarrito.findByPk(req.params.id);
  if (!registro) return res.status(404).json({ mensaje: 'ProductoPorCarrito no encontrado' });
  await registro.update(req.body);
  res.json(registro);
};

export const eliminarProductoPorCarrito = async (req, res) => {
  const registro = await ProductoPorCarrito.findByPk(req.params.id);
  if (!registro) return res.status(404).json({ mensaje: 'ProductoPorCarrito no encontrado' });
  await registro.destroy();
  res.json({ mensaje: 'ProductoPorCarrito eliminado' });
};