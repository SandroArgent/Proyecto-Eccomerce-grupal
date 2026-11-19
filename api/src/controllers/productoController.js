import { Op } from 'sequelize';
import { sequelize, Producto, ImagenProducto, Categoria,  Marca } from '../models/index.js';
import { MAX_IMAGENES_POR_PRODUCTO } from '../middleware/upload.js';
import { urlPublica, borrarArchivoPorUrl, borrarArchivosSubidos } from '../utils/archivos.js';

// GET /productos?categoria=2&q=guitarra&page=1&limit=12&destacado=true
// Endpoint público del catálogo: soporta filtro por categoría, búsqueda
// por nombre, y paginación. Se usa tanto desde la tienda pública (catálogo
// y home) como desde el panel de admin (que simplemente pide un límite alto).
export const getProductos = async (req, res) => {
  const { categoria, marca, q, page = 1, limit = 12, destacado } = req.query;
  console.log('Marca recibida:', marca);

  const where = {};

  if (marca) {
    where.idMarca = marca;
  }
  if (categoria) {
  const categoriaId = Number(categoria);

  console.log('Where final:', where);

  const categoriasHijas = await Categoria.findAll({
    where: {
      idCategoriaPadre: categoriaId,
    },
  });

  const categoriasPermitidas = [
    categoriaId,
    ...categoriasHijas.map((c) => c.id),
  ];

  where.idCategoria = {
    [Op.in]: categoriasPermitidas,
  };
}
  if (destacado !== undefined) where.destacado = destacado === 'true';
  if (q) where.nombre = { [Op.like]: `%${q}%` };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 12, 1);
  const offset = (pageNum - 1) * limitNum;

  const { rows: productos, count: total } = await Producto.findAndCountAll({
    where,
    include: [
               { model: ImagenProducto },
                 
               {
                 model: Marca,
                 as: 'Marca',
               },
             ],
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
    include: [
               { model: ImagenProducto },
                 
               {
                 model: Categoria,
                 as: 'Categoria',
               },
             
               {
                 model: Marca,
                 as: 'Marca',
               },
             ],
  });
  if (!producto) {
    return res.status(404).json({ estado: false, mensaje: 'Producto no encontrado' });
  }
  res.json({ estado: true, data: producto });
};

// Con multipart/form-data todos los campos de texto llegan como string
// (por ejemplo destacado = "true", idCategoria = ""). Acá los dejamos
// listos para guardar en la base.
const prepararDatosProducto = (body) => {
  // imagenesEliminar no es una columna: se usa aparte para borrar imágenes.
  const { imagenesEliminar, ...datos } = body;

  if (datos.idCategoria === '') datos.idCategoria = null;
  if (typeof datos.destacado === 'string') datos.destacado = datos.destacado === 'true';

  return datos;
};

// imagenesEliminar llega como texto JSON: '[3,5]'.
const parsearIdsAEliminar = (valor) => {
  if (!valor) return [];
  try {
    const ids = typeof valor === 'string' ? JSON.parse(valor) : valor;
    return Array.isArray(ids) ? ids.map(Number).filter(Number.isInteger) : [];
  } catch {
    return [];
  }
};

// POST /productos — recibe multipart/form-data: campos de texto + hasta 5
// archivos en "imagenes". La primera imagen queda como imagen principal
// (columna producto.imagen) y todas se guardan en imagenes_producto.
export const crearProducto = async (req, res) => {
  const archivos = req.files || [];

  try {
    const producto = await sequelize.transaction(async (t) => {

      const datos =
        prepararDatosProducto(req.body);

      if (datos.idMarca) {
        const marca =
          await Marca.findByPk(
            datos.idMarca
          );
        
        if (marca) {
          datos.marca =
            marca.nombre;
        }
      }

      const nuevo =
        await Producto.create(
          datos,
          { transaction: t }
        );

      for (const archivo of archivos) {
        await ImagenProducto.create(
          { nombre: nuevo.nombre, urlImagen: urlPublica(archivo), idProducto: nuevo.id },
          { transaction: t }
        );
      }

      if (archivos.length > 0) {
        await nuevo.update({ imagen: urlPublica(archivos[0]) }, { transaction: t });
      }
      return nuevo;
    });

    const completo = await Producto.findByPk(producto.id, { include: [{ model: ImagenProducto }] });
    res.status(201).json(completo);
  } catch (error) {
    console.error(error);
    // Si algo falló, no dejamos las imágenes huérfanas en disco.
    await borrarArchivosSubidos(archivos);
    res.status(500).json({ mensaje: 'Error al crear producto' });
  }
};

// PUT /productos/:id — además de los campos de texto acepta:
//   imagenes          -> archivos nuevos para agregar
//   imagenesEliminar  -> JSON con los ids de ImagenProducto a quitar, ej "[3,5]"
// Las imágenes que no se mencionan quedan como estaban.
export const actualizarProducto = async (req, res) => {
  const archivos = req.files || [];

  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) {
      await borrarArchivosSubidos(archivos);
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const idsAEliminar = parsearIdsAEliminar(req.body.imagenesEliminar);

    // Controlamos el máximo total (las que ya tiene - las que quita + las nuevas).
    const actuales = await ImagenProducto.findAll({ where: { idProducto: producto.id } });
    const aBorrar = actuales.filter((img) => idsAEliminar.includes(img.id));
    const totalFinal = actuales.length - aBorrar.length + archivos.length;

    if (totalFinal > MAX_IMAGENES_POR_PRODUCTO) {
      await borrarArchivosSubidos(archivos);
      return res.status(400).json({
        estado: false,
        mensaje: `Un producto puede tener como máximo ${MAX_IMAGENES_POR_PRODUCTO} imágenes.`,
      });
    }

    await sequelize.transaction(async (t) => {


      const datos = prepararDatosProducto(req.body);

        if (datos.idMarca) {
          const marca =
            await Marca.findByPk(
              datos.idMarca
            );
          
          if (marca) {
            datos.marca =
              marca.nombre;
          }
        }

        await producto.update(
          datos,
          { transaction: t }
        );

      if (aBorrar.length > 0) {
        await ImagenProducto.destroy({
          where: { id: aBorrar.map((img) => img.id) },
          transaction: t,
        });
      }

      for (const archivo of archivos) {
        await ImagenProducto.create(
          { nombre: producto.nombre, urlImagen: urlPublica(archivo), idProducto: producto.id },
          { transaction: t }
        );
      }

      // Si cambiaron las imágenes, la principal pasa a ser la primera que quede.
      // Si no se tocaron, no se modifica producto.imagen.
      if (aBorrar.length > 0 || archivos.length > 0) {
        const primera = await ImagenProducto.findOne({
          where: { idProducto: producto.id },
          order: [['id', 'ASC']],
          transaction: t,
        });
        await producto.update({ imagen: primera ? primera.urlImagen : null }, { transaction: t });
      }
    });

    // Recién con la base ya confirmada borramos los archivos viejos del disco.
    await Promise.all(aBorrar.map((img) => borrarArchivoPorUrl(img.urlImagen)));

    const completo = await Producto.findByPk(producto.id, { include: [{ model: ImagenProducto }] });
    res.json(completo);
  } catch (error) {
    console.error(error);
    await borrarArchivosSubidos(archivos);
    res.status(500).json({ mensaje: 'Error al actualizar producto' });
  }
};

export const eliminarProducto = async (req, res) => {
  const producto = await Producto.findByPk(req.params.id, {
    include: [{ model: ImagenProducto }],
  });
  if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

  const imagenes = producto.ImagenProductos || [];
  await ImagenProducto.destroy({ where: { idProducto: producto.id } });
  await producto.destroy();
  await Promise.all(imagenes.map((img) => borrarArchivoPorUrl(img.urlImagen)));

  res.json({ mensaje: 'Producto eliminado' });
};
