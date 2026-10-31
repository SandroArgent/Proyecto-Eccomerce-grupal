// authController.js maneja el inicio de sesión y el registro.
// Hay dos logins separados, igual que en el ejemplo del profe:
// - /api/auth/usuario/login  y /api/auth/usuario/registro  para clientes del ecommerce.
// - /api/auth/admin/login                                   para administradores.
// Cada uno genera un JWT distinto, por eso un token de usuario no sirve
// para acceder a rutas de admin, y viceversa.

import {
  compararPassword,
  generarToken,
  JWT_SECRET_USUARIO,
  JWT_SECRET_ADMIN,
  generarTokenRecuperacion,
  leerIdDeTokenRecuperacion,
  verificarTokenRecuperacion,
} from '../utils/auth.js';
import { Usuario, Administrador, Carrito } from '../models/index.js';
// MÓDULO B: funciones del servicio de mensajería (ver services/mailService.js).
import { enviarBienvenida, enviarRecuperacionClave } from '../services/mailService.js';

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

    // MÓDULO B — mail de bienvenida.
    // OJO: no lleva "await" a propósito. Mandar un mail puede tardar unos
    // segundos; con "await" el usuario se quedaría esperando en la pantalla
    // de registro hasta que el mail salga. Sin "await" la función arranca,
    // y el código sigue de largo respondiendo al instante. Es seguro porque
    // enviarBienvenida() nunca tira errores (los captura ella misma).
    enviarBienvenida(usuario);

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

// ─────────────────────────────────────────────────────────────────────
// MÓDULO B — Recuperación de contraseña (2 pasos)
// ─────────────────────────────────────────────────────────────────────
//   Paso 1: POST /api/auth/usuario/olvide-clave       { email }
//           -> si el email existe, se le manda un mail con un enlace.
//   Paso 2: POST /api/auth/usuario/restablecer-clave  { token, contraseña }
//           -> el token viene del enlace del mail; se guarda la clave nueva.

/**
 * olvideClave (paso 1)
 * Recibe un email y, si pertenece a un usuario, le manda el mail con el enlace.
 */
export const olvideClave = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        estado: false,
        mensaje: 'Debe proporcionar un email',
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    if (usuario) {
      const token = generarTokenRecuperacion(usuario);
      // Sin "await" (igual que en el registro): el mail sale en segundo plano.
      enviarRecuperacionClave(usuario, token);
    }

    // SEGURIDAD: respondemos EXACTAMENTE lo mismo exista o no el email.
    // Si dijéramos "ese email no está registrado", cualquiera podría usar
    // este formulario para averiguar qué personas tienen cuenta en la tienda.
    res.json({
      estado: true,
      mensaje:
        'Si el email está registrado, te enviamos un correo con las instrucciones para restablecer tu contraseña.',
    });
  } catch (error) {
    console.error('Error en olvideClave:', error);
    res.status(500).json({
      estado: false,
      mensaje: 'No se pudo procesar la solicitud',
      error: error.message,
    });
  }
};

/**
 * restablecerClave (paso 2)
 * Recibe el token del enlace y la contraseña nueva. Si el token es válido,
 * guarda la nueva contraseña.
 *
 * Nota: los errores de acá devuelven 400 y NO 401. Es a propósito: el
 * interceptor de Axios del frontend manda al login ante cualquier 401/403, y
 * acá el usuario justamente todavía no está logueado.
 */
export const restablecerClave = async (req, res) => {
  try {
    const { token, contraseña } = req.body;

    if (!token || !contraseña) {
      return res.status(400).json({
        estado: false,
        mensaje: 'Faltan datos: se necesita el token y la nueva contraseña',
      });
    }

    if (contraseña.length < 6) {
      return res.status(400).json({
        estado: false,
        mensaje: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    // 1) ¿De qué usuario es este token? (todavía sin confiar en él)
    const idUsuario = leerIdDeTokenRecuperacion(token);
    const usuario = idUsuario ? await Usuario.findByPk(idUsuario) : null;

    const mensajeInvalido = 'El enlace no es válido o ya venció. Pedí uno nuevo.';

    if (!usuario) {
      return res.status(400).json({ estado: false, mensaje: mensajeInvalido });
    }

    // 2) Ahora sí: verificar firma, vencimiento y que no se haya usado antes.
    try {
      verificarTokenRecuperacion(token, usuario);
    } catch {
      return res.status(400).json({ estado: false, mensaje: mensajeInvalido });
    }

    // 3) Guardar la contraseña nueva. Al hacer save(), el hook "beforeUpdate"
    // del modelo Usuario la encripta solo (igual que en el registro).
    usuario.contraseña = contraseña;
    await usuario.save();

    res.json({
      estado: true,
      mensaje: 'Tu contraseña se actualizó correctamente. Ya podés iniciar sesión.',
    });
  } catch (error) {
    console.error('Error en restablecerClave:', error);
    res.status(500).json({
      estado: false,
      mensaje: 'No se pudo restablecer la contraseña',
      error: error.message,
    });
  }
};
