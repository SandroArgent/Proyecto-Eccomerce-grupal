import { Carrito } from '../models/index.js';

export const getCarritos = async (req, res) => {
  const carritos = await Carrito.findAll();
  res.json(carritos);
};

export const getCarritoPorId = async (req, res) => {
  const carrito = await Carrito.findByPk(req.params.id);
  if (!carrito) return res.status(404).json({ mensaje: 'Carrito no encontrado' });
  res.json(carrito);
};

export const crearCarrito = async (req, res) => {
  const nuevoCarrito = await Carrito.create(req.body);
  res.status(201).json(nuevoCarrito);
};

export const actualizarCarrito = async (req, res) => {
  const carrito = await Carrito.findByPk(req.params.id);
  if (!carrito) return res.status(404).json({ mensaje: 'Carrito no encontrado' });
  await carrito.update(req.body);
  res.json(carrito);
};

export const eliminarCarrito = async (req, res) => {
  const carrito = await Carrito.findByPk(req.params.id);
  if (!carrito) return res.status(404).json({ mensaje: 'Carrito no encontrado' });
  await carrito.destroy();
  res.json({ mensaje: 'Carrito eliminado' });
};