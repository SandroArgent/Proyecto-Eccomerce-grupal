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
import {
  enviarBienvenida,
  enviarRecuperacionClave,
  enviarCodigoVerificacion,
} from '../services/mailService.js';
import {
  emitirCodigo,
  obtenerPendiente,
  cancelarPendiente,
  verificarCodigo,
} from '../utils/codigosVerificacion.js';

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
 * registrarUsuario (paso 1 del registro)
 * Valida los datos y le manda un código de 6 dígitos al email. TODAVÍA NO crea
 * el usuario: eso pasa en verificarRegistro, cuando ingresa el código bien.
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

    const emitido = emitirCodigo({ nombre, apellido, email, contraseña });

    if (!emitido.ok) {
      return res.status(429).json({
        estado: false,
        mensaje: `Esperá ${emitido.esperar} segundos antes de pedir otro código.`,
      });
    }

    // Acá SÍ esperamos el envío: si el mail no sale, hay que avisar.
    const enviado = await enviarCodigoVerificacion({ nombre, email }, emitido.codigo);

    if (!enviado) {
      cancelarPendiente(email);
      return res.status(502).json({
        estado: false,
        mensaje: 'No pudimos enviar el código. Revisá que el email sea correcto e intentá de nuevo.',
      });
    }

    res.json({
      estado: true,
      pendiente: true,
      mensaje: 'Te enviamos un código de 6 dígitos a tu email.',
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
 * verificarRegistro (paso 2 del registro)
 * Recibe { email, codigo }. Si el código es correcto, crea el usuario (el hook
 * del modelo encripta la contraseña), le crea un Carrito vacío -relación 1:1
 * del DER- y devuelve un token para dejarlo logueado de una.
 *
 * Los errores devuelven 400 y NO 401: el interceptor de Axios del frontend
 * manda al login ante cualquier 401/403.
 */
export const verificarRegistro = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({
        estado: false,
        mensaje: 'Debe proporcionar email y código',
      });
    }

    const resultado = verificarCodigo(email, codigo);

    if (!resultado.ok) {
      return res.status(400).json({ estado: false, mensaje: resultado.motivo });
    }

    const { nombre, apellido, contraseña } = resultado.datos;

    // Por si el email se registró por otro lado mientras esperaba el código.
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

    await Carrito.create({ idUsuario: usuario.id });

    // MÓDULO B — mail de bienvenida (sin "await" a propósito: nunca tira errores
    // y así la respuesta no espera al mail).
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
    console.error('Error en verificarRegistro:', error);
    res.status(500).json({
      estado: false,
      mensaje: 'Error al confirmar el registro',
      error: error.message,
    });
  }
};

/**
 * reenviarCodigo
 * Recibe { email } y manda un código nuevo usando los datos del registro pendiente.
 */
export const reenviarCodigo = async (req, res) => {
  try {
    const { email } = req.body;
    const datos = email ? obtenerPendiente(email) : null;

    if (!datos) {
      return res.status(400).json({
        estado: false,
        mensaje: 'No hay un registro pendiente para ese email. Volvé a completar el formulario.',
      });
    }

    const emitido = emitirCodigo(datos);

    if (!emitido.ok) {
      return res.status(429).json({
        estado: false,
        mensaje: `Esperá ${emitido.esperar} segundos antes de pedir otro código.`,
      });
    }

    const enviado = await enviarCodigoVerificacion(datos, emitido.codigo);

    if (!enviado) {
      return res.status(502).json({
        estado: false,
        mensaje: 'No pudimos enviar el código. Intentá de nuevo en unos minutos.',
      });
    }

    res.json({ estado: true, mensaje: 'Te enviamos un código nuevo.' });
  } catch (error) {
    console.error('Error en reenviarCodigo:', error);
    res.status(500).json({
      estado: false,
      mensaje: 'No se pudo reenviar el código',
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
 * actualizarPerfilUsuario
 * Actualiza nombre, apellido y email del usuario logueado.
 * Si el EMAIL cambió, no se guarda todavía: se manda un código al email nuevo
 * (para comprobar que existe y es suyo) y los cambios se aplican recién en
 * verificarEmailPerfil, al ingresar el código. Si no cambió el email, se
 * guarda directo.
 */
export const actualizarPerfilUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        estado: false,
        mensaje: 'Usuario no encontrado',
      });
    }

    const { nombre, apellido, email } = req.body;
    const emailCambio =
      email !== undefined &&
      String(email).trim().toLowerCase() !== String(usuario.email).trim().toLowerCase();

    if (emailCambio) {
      if (!String(email).trim()) {
        return res.status(400).json({ estado: false, mensaje: 'El email no puede estar vacío' });
      }

      const enUso = await Usuario.findOne({ where: { email } });
      if (enUso && enUso.id !== usuario.id) {
        return res.status(400).json({
          estado: false,
          mensaje: 'El email ya está registrado',
        });
      }

      const datos = {
        nombre: nombre ?? usuario.nombre,
        apellido: apellido ?? usuario.apellido,
        nuevoEmail: String(email).trim(),
      };
      const emitido = emitirCodigo(datos, usuario.id, 'perfil');

      if (!emitido.ok) {
        return res.status(429).json({
          estado: false,
          mensaje: `Esperá ${emitido.esperar} segundos antes de pedir otro código.`,
        });
      }

      const enviado = await enviarCodigoVerificacion(
        { nombre: datos.nombre, email: datos.nuevoEmail },
        emitido.codigo
      );

      if (!enviado) {
        cancelarPendiente(usuario.id, 'perfil');
        return res.status(502).json({
          estado: false,
          mensaje: 'No pudimos enviar el código. Revisá que el email sea correcto e intentá de nuevo.',
        });
      }

      // Sin campo "data" a propósito: así el interceptor de Axios entrega el
      // objeto completo y el frontend puede ver "pendiente".
      return res.json({
        estado: true,
        pendiente: true,
        mensaje: `Te enviamos un código de 6 dígitos a ${datos.nuevoEmail}.`,
      });
    }

    await usuario.update({ nombre, apellido });

    res.json({
      estado: true,
      mensaje: 'Perfil actualizado correctamente',
      data: await Usuario.findByPk(usuario.id, { attributes: { exclude: ['contraseña'] } }),
    });
  } catch (error) {
    console.error('Error en actualizarPerfilUsuario:', error);

    res.status(500).json({
      estado: false,
      mensaje: 'Error al actualizar perfil',
      error: error.message,
    });
  }
};

/**
 * verificarEmailPerfil
 * Recibe { codigo }. Si es correcto, aplica el cambio de email (y de
 * nombre/apellido si venían en la misma edición).
 * Errores en 400 (no 401) por el interceptor de Axios del frontend.
 */
export const verificarEmailPerfil = async (req, res) => {
  try {
    const { codigo } = req.body;

    if (!codigo) {
      return res.status(400).json({ estado: false, mensaje: 'Debe proporcionar el código' });
    }

    const resultado = verificarCodigo(req.usuario.id, codigo, 'perfil');

    if (!resultado.ok) {
      return res.status(400).json({ estado: false, mensaje: resultado.motivo });
    }

    const { nombre, apellido, nuevoEmail } = resultado.datos;

    // Por si alguien tomó ese email mientras esperaba el código.
    const enUso = await Usuario.findOne({ where: { email: nuevoEmail } });
    if (enUso && enUso.id !== req.usuario.id) {
      return res.status(400).json({ estado: false, mensaje: 'El email ya está registrado' });
    }

    const usuario = await Usuario.findByPk(req.usuario.id);
    await usuario.update({ nombre, apellido, email: nuevoEmail });

    res.json({
      estado: true,
      mensaje: 'Perfil actualizado correctamente',
      data: await Usuario.findByPk(usuario.id, { attributes: { exclude: ['contraseña'] } }),
    });
  } catch (error) {
    console.error('Error en verificarEmailPerfil:', error);
    res.status(500).json({
      estado: false,
      mensaje: 'Error al confirmar el email',
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
