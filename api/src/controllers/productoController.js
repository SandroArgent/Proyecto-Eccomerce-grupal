import { Op } from 'sequelize';
import { Producto, ImagenProducto, Categoria } from '../models/index.js';

// GET /productos?categoria=2&q=guitarra&page=1&limit=12&destacado=true
// Endpoint público del catálogo: soporta filtro por categoría, búsqueda
// por nombre, y paginación. Se usa tanto desde la tienda pública (catálogo
// y home) como desde el panel de admin (que simplemente pide un límite alto).
export const getProductos = async (req, res) => {
  const { categoria, q, page = 1, limit = 12, destacado } = req.query;

  const where = {};
  if (categoria) where.idCategoria = categoria;
  if (destacado !== undefined) where.destacado = destacado === 'true';
  if (q) where.nombre = { [Op.like]: `%${q}%` };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 12, 1);
  const offset = (pageNum - 1) * limitNum;

  const { rows: productos, count: total } = await Producto.findAndCountAll({
    where,
    include: [{ model: ImagenProducto }],
    limit: limitNum,
    offset,
    order: [['id', 'DESC']],
    distinct: true, // evita que el include duplique el conteo de "total"
  });

  res.json({
    estado: true,
    data: {
      productos,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
};

// GET /productos/:id — detalle individual, con galería de imágenes y categoría.
export const getProductoPorId = async (req, res) => {
  const producto = await Producto.findByPk(req.params.id, {
    include: [{ model: ImagenProducto }, { model: Categoria, as: 'Categoria' }],
  });
  if (!producto) {
    return res.status(404).json({ estado: false, mensaje: 'Producto no encontrado' });
  }
  res.json({ estado: true, data: producto });
};

export const crearProducto = async (req, res) => {
  const nuevoProducto = await Producto.create(req.body);
  res.status(201).json(nuevoProducto);
};

export const actualizarProducto = async (req, res) => {
  const producto = await Producto.findByPk(req.params.id);
  if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
  await producto.update(req.body);
  res.json(producto);
};

export const eliminarProducto = async (req, res) => {
  const producto = await Producto.findByPk(req.params.id);
  if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
  await producto.destroy();
  res.json({ mensaje: 'Producto eliminado' });
};
