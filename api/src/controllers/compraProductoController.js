import { CompraProducto } from '../models/index.js';

export const getCompraProductos = async (req, res) => {
  const compraProductos = await CompraProducto.findAll();
  res.json(compraProductos);
};

export const getCompraProductoPorId = async (req, res) => {
  const compraProducto = await CompraProducto.findByPk(req.params.id);
  if (!compraProducto) return res.status(404).json({ mensaje: 'CompraProducto no encontrado' });
  res.json(compraProducto);
};

export const crearCompraProducto = async (req, res) => {
  const nuevoCompraProducto = await CompraProducto.create(req.body);
  res.status(201).json(nuevoCompraProducto);
};

export const actualizarCompraProducto = async (req, res) => {
  const compraProducto = await CompraProducto.findByPk(req.params.id);
  if (!compraProducto) return res.status(404).json({ mensaje: 'CompraProducto no encontrado' });
  await compraProducto.update(req.body);
  res.json(compraProducto);
};

export const eliminarCompraProducto = async (req, res) => {
  const compraProducto = await CompraProducto.findByPk(req.params.id);
  if (!compraProducto) return res.status(404).json({ mensaje: 'CompraProducto no encontrado' });
  await compraProducto.destroy();
  res.json({ mensaje: 'CompraProducto eliminado' });
};