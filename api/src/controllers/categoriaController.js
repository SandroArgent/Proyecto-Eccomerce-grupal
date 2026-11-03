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

//crear categoria con validación para evitar duplicados 
export const crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    const nombreNormalizado = nombre.trim().toLowerCase();

    const categorias = await Categoria.findAll();

    const categoriaExistente = categorias.find(
      (c) =>
        c.nombre.trim().toLowerCase() ===
        nombreNormalizado
    );

    if (categoriaExistente) {
      return res.status(400).json({
        estado: false,
        mensaje:
          'Ya existe una categoría con ese nombre.',
      });
    }

    const nuevaCategoria =
      await Categoria.create(req.body);

    res.status(201).json({
      estado: true,
      data: nuevaCategoria,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      estado: false,
      mensaje:
        'Error al crear la categoría.',
    });
  }
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