import { Categoria } from '../models/index.js';

export const getCategorias = async (req, res) => {
  const categorias = await Categoria.findAll();
  res.json(categorias);
};

export const getCategoriaPorId = async (req, res) => {
  const categoria = await Categoria.findByPk(req.params.id);
  if (!categoria) return res.status(404).json({ mensaje: 'Categoria no encontrada' });
  res.json(categoria);
};

export const crearCategoria = async (req, res) => {
  const nuevoCategoria = await Categoria.create(req.body);
  res.status(201).json(nuevoCategoria);
};

export const actualizarCategoria = async (req, res) => {
  const categoria = await Categoria.findByPk(req.params.id);
  if (!categoria) return res.status(404).json({ mensaje: 'Categoria no encontrada' });
  await categoria.update(req.body);
  res.json(categoria);
};

export const eliminarCategoria = async (req, res) => {
  const categoria = await Categoria.findByPk(req.params.id);
  if (!categoria) return res.status(404).json({ mensaje: 'Categoria no encontrada' });
  await categoria.destroy();
  res.json({ mensaje: 'Categoria eliminado' });
};