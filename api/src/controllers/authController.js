// authController.js maneja el inicio de sesión y el registro.
// Hay dos logins separados, igual que en el ejemplo del profe:
// - /api/auth/usuario/login  y /api/auth/usuario/registro  para clientes del ecommerce.
// - /api/auth/admin/login                                   para administradores.
// Cada uno genera un JWT distinto, por eso un token de usuario no sirve
// para acceder a rutas de admin, y viceversa.

import { compararPassword, generarToken, JWT_SECRET_USUARIO, JWT_SECRET_ADMIN } from '../utils/auth.js';
import { Usuario, Administrador, Carrito } from '../models/index.js';

/**
 * loginUsuario
 * Recibe email y contraseña, valida contra el modelo Usuario y
 * devuelve un token JWT firmado con el secreto de usuario.
 */
export const loginUsuario = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({
        estado: false,
        mensaje: 'Debe proporcionar email y contraseña',
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(401).json({
        estado: false,
        mensaje: 'Credenciales inválidas',
      });
    }

    const passwordValido = await compararPassword(contraseña, usuario.contraseña);

    if (!passwordValido) {
      return res.status(401).json({
        estado: false,
        mensaje: 'Credenciales inválidas',
      });
    }

    // El token solo guarda el id: cualquier otro dato se puede pedir
    // después con /api/auth/usuario/perfil, evitando que el token quede
    // desactualizado si el usuario cambia sus datos.
    const token = generarToken({ id: usuario.id }, JWT_SECRET_USUARIO);

    res.json({
      estado: true,
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en loginUsuario:', error);
    res.status(500).json({
      estado: false,
      mensaje: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};

/**
 * registrarUsuario
 * Crea un usuario nuevo (el hook del modelo Usuario encripta la contraseña
 * automáticamente), le crea un Carrito vacío -porque según el DER la
 * relación Usuario-Carrito es 1:1- y devuelve un token para dejarlo
 * logueado de una.
 */
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, contraseña } = req.body;

    if (!nombre || !email || !contraseña) {
      return res.status(400).json({
        estado: false,
        mensaje: 'Debe proporcionar nombre, email y contraseña',
      });
    }

    const existe = await Usuario.findOne({ where: { email } });

    if (existe) {
      return res.status(400).json({
        estado: false,
        mensaje: 'El email ya está registrado',
      });
    }

    // rol: 'cliente' por defecto. Nunca confiamos en un rol que venga
    // en el body, porque cualquiera podría mandar { rol: 'admin' }.
    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      contraseña,
      rol: 'cliente',
    });

    // Creamos el carrito vacío asociado, para que el usuario ya tenga
    // uno disponible apenas se registra (relación 1:1 del DER).
    await Carrito.create({ idUsuario: usuario.id });

    const token = generarToken({ id: usuario.id }, JWT_SECRET_USUARIO);

    res.status(201).json({
      estado: true,
      mensaje: 'Registro exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en registrarUsuario:', error);
    res.status(500).json({
      estado: false,
      mensaje: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

/**
 * perfilUsuario
 * Devuelve los datos del usuario logueado (sin la contraseña).
 * Requiere pasar por el middleware verificarUsuario antes.
 */
export const perfilUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['contraseña'] },
    });

    res.json({
      estado: true,
      data: usuario,
    });
  } catch (error) {
    console.error('Error en perfilUsuario:', error);
    res.status(500).json({
      estado: false,
      mensaje: 'Error al obtener perfil',
      error: error.message,
    });
  }
};

/**
 * loginAdmin
 * Recibe email y contraseña, valida contra el modelo Administrador y
 * devuelve un token JWT firmado con el secreto de admin.
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({
        estado: false,
        mensaje: 'Debe proporcionar email y contraseña',
      });
    }

    const administrador = await Administrador.findOne({ where: { email } });

    if (!administrador) {
      return res.status(401).json({
        estado: false,
        mensaje: 'Credenciales inválidas',
      });
    }

    const passwordValido = await compararPassword(contraseña, administrador.contraseña);

    if (!passwordValido) {
      return res.status(401).json({
        estado: false,
        mensaje: 'Credenciales inválidas',
      });
    }

    const token = generarToken({ id: administrador.id }, JWT_SECRET_ADMIN);

    res.json({
      estado: true,
      mensaje: 'Login de administrador exitoso',
      token,
      administrador: {
        id: administrador.id,
        nombre: administrador.nombre,
        email: administrador.email,
      },
    });
  } catch (error) {
    console.error('Error en loginAdmin:', error);
    res.status(500).json({
      estado: false,
      mensaje: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};
