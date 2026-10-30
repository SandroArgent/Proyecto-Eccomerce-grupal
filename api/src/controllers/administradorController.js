import { Administrador } from '../models/index.js';

// attributes: { exclude: ['contraseña'] } evita que el hash de la
// contraseña viaje en la respuesta del listado/detalle de administradores.
export const getAdministradores = async (req, res) => {
  const administradors = await Administrador.findAll({ attributes: { exclude: ['contraseña'] } });
  res.json(administradors);
};

export const getAdministradorPorId = async (req, res) => {
  const administrador = await Administrador.findByPk(req.params.id, { attributes: { exclude: ['contraseña'] } });
  if (!administrador) return res.status(404).json({ mensaje: 'Administrador no encontrado' });
  res.json(administrador);
};

export const crearAdministrador = async (req, res) => {
  const nuevoAdministrador = await Administrador.create(req.body);
  res.status(201).json(nuevoAdministrador);
};

export const actualizarAdministrador = async (req, res) => {
  const administrador = await Administrador.findByPk(req.params.id);
  if (!administrador) return res.status(404).json({ mensaje: 'Administrador no encontrado' });
  await administrador.update(req.body);
  res.json(administrador);
};

export const eliminarAdministrador = async (req, res) => {
  const administrador = await Administrador.findByPk(req.params.id);
  if (!administrador) return res.status(404).json({ mensaje: 'Administrador no encontrado' });
  await administrador.destroy();
  res.json({ mensaje: 'Administrador eliminado' });
};