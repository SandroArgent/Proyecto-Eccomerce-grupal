import { Usuario } from '../models/index.js';

// attributes: { exclude: ['contraseña'] } evita que el hash de la
// contraseña viaje en la respuesta del listado/detalle de usuarios.
export const getUsuarios = async (req, res) => {
  const usuarios = await Usuario.findAll({ attributes: { exclude: ['contraseña'] } });
  res.json(usuarios);
};

export const getUsuarioPorId = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id, { attributes: { exclude: ['contraseña'] } });
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  res.json(usuario);
};

export const crearUsuario = async (req, res) => {
  const nuevoUsuario = await Usuario.create(req.body);
  res.status(201).json(nuevoUsuario);
};

export const actualizarUsuario = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  await usuario.update(req.body);
  res.json(usuario);
};

export const eliminarUsuario = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  await usuario.destroy();
  res.json({ mensaje: 'Usuario eliminado' });
};