import { Marca } from '../models/index.js';

export const getMarcas = async (req, res) => {
  const marcas = await Marca.findAll({
    order: [['nombre', 'ASC']],
  });

  res.json(marcas);
};

export const getMarcaPorId = async (req, res) => {
  const marca = await Marca.findByPk(req.params.id);

  if (!marca) {
    return res.status(404).json({
      mensaje: 'Marca no encontrada',
    });
  }

  res.json(marca);
};

export const crearMarca = async (req, res) => {
  try {
    const { nombre } = req.body;

    const nombreNormalizado =
      nombre.trim().toLowerCase();

    const marcas = await Marca.findAll();

    const marcaExistente = marcas.find(
      (m) =>
        m.nombre.trim().toLowerCase() ===
        nombreNormalizado
    );

    if (marcaExistente) {
      return res.status(400).json({
        estado: false,
        mensaje:
          'Ya existe una marca con ese nombre.',
      });
    }

    const nuevaMarca =
      await Marca.create(req.body);

    res.status(201).json({
      estado: true,
      data: nuevaMarca,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      estado: false,
      mensaje: 'Error al crear la marca.',
    });
  }
};

export const actualizarMarca = async (req, res) => {
  const marca = await Marca.findByPk(
    req.params.id
  );

  if (!marca) {
    return res.status(404).json({
      mensaje: 'Marca no encontrada',
    });
  }

  await marca.update(req.body);

  res.json(marca);
};

export const eliminarMarca = async (req, res) => {
  const marca = await Marca.findByPk(
    req.params.id
  );

  if (!marca) {
    return res.status(404).json({
      mensaje: 'Marca no encontrada',
    });
  }

  await marca.destroy();

  res.status(204).send();
};