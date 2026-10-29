import { ImagenProducto } from '../models/index.js';

export const getImagenProductos = async (req, res) => {
  const imagenProductos = await ImagenProducto.findAll();
  res.json(imagenProductos);
};

export const getImagenProductoPorId = async (req, res) => {
  const imagenProducto = await ImagenProducto.findByPk(req.params.id);
  if (!imagenProducto) return res.status(404).json({ mensaje: 'ImagenProducto no encontrado' });
  res.json(imagenProducto);
};

export const crearImagenProducto = async (req, res) => {
  const nuevoImagenProducto = await ImagenProducto.create(req.body);
  res.status(201).json(nuevoImagenProducto);
};

export const actualizarImagenProducto = async (req, res) => {
  const imagenProducto = await ImagenProducto.findByPk(req.params.id);
  if (!imagenProducto) return res.status(404).json({ mensaje: 'ImagenProducto no encontrado' });
  await imagenProducto.update(req.body);
  res.json(imagenProducto);
};

export const eliminarImagenProducto = async (req, res) => {
  const imagenProducto = await ImagenProducto.findByPk(req.params.id);
  if (!imagenProducto) return res.status(404).json({ mensaje: 'ImagenProducto no encontrado' });
  await imagenProducto.destroy();
  res.json({ mensaje: 'ImagenProducto eliminado' });
};