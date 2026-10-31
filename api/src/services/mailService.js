// mailService.js — MÓDULO B: servicio de mensajería por mail.
//
// IDEA CENTRAL: todo lo que tiene que ver con mandar mails vive en ESTE
// archivo. Los controladores (registro, pedidos, etc.) no saben nada de SMTP
// ni de HTML: solo llaman a una de las funciones exportadas abajo, por
// ejemplo `enviarBienvenida(usuario)`. Si mañana se cambia Gmail por otro
// proveedor, se toca solo este archivo.
//
// REGLA DE ORO: ninguna función de acá adentro puede tirar un error hacia
// afuera. Un mail que falla (sin internet, contraseña mala, etc.) NUNCA debe
// romper un registro o una compra que ya se guardó bien en la base de datos.

import nodemailer from 'nodemailer';
import { Compra, CompraProducto, Producto, Usuario, Administrador } from '../models/index.js';

// ─────────────────────────────────────────────────────────────────────
// 1. CONFIGURACIÓN (todo sale de variables de entorno, o sea del .env)
// ─────────────────────────────────────────────────────────────────────
// Son funciones y no constantes, para leer process.env recién cuando se
// usan (así no dependemos del orden en que se cargó dotenv).

const nombreTienda = () => process.env.NOMBRE_TIENDA || 'Tienda de Música';

// Dirección del frontend (React), para armar los enlaces de los mails.
const urlFrontend = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const remitente = () => {
  if (process.env.MAIL_FROM) return process.env.MAIL_FROM;
  const cuenta = process.env.MAIL_USER || 'no-reply@tienda.local';
  return `"${nombreTienda()}" <${cuenta}>`;
};

// ─────────────────────────────────────────────────────────────────────
// 2. TRANSPORTER: el "cartero" de Nodemailer
// ─────────────────────────────────────────────────────────────────────
// Un transporter es el objeto que sabe CÓMO entregar un mail. Se crea una
// sola vez y se reutiliza (por eso las variables de abajo, que lo guardan).
//
// Dos modos:
//   - Si hay MAIL_HOST en el .env  -> SMTP real (Gmail u otro): el mail sale de verdad.
//   - Si NO hay MAIL_HOST          -> MODO PRUEBA: el mail no sale, solo se
//                                     muestra en la consola del servidor.
//     Esto sirve para desarrollar sin configurar nada y sin spamear a nadie.

let transporter = null;
let modoPrueba = false;

const obtenerTransporter = () => {
  if (transporter) return transporter;

  if (process.env.MAIL_HOST) {
    const config = {
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      // secure:true se usa con el puerto 465 (conexión cifrada desde el inicio).
      // Con el 587 se deja en false y la conexión se cifra después (STARTTLS).
      secure: process.env.MAIL_SECURE === 'true',
    };
    if (process.env.MAIL_USER) {
      config.auth = {
        user: process.env.MAIL_USER,
        // Gmail muestra la "contraseña de aplicación" con espacios; los sacamos.
        pass: (process.env.MAIL_PASS || '').replace(/\s/g, ''),
      };
    }
    transporter = nodemailer.createTransport(config);
    modoPrueba = false;
  } else {
    // jsonTransport = "no mandes nada, solo armame el mail como objeto".
    transporter = nodemailer.createTransport({ jsonTransport: true });
    modoPrueba = true;
    console.warn(
      '⚠️  MAIL_HOST no está configurado: los mails NO se envían, solo se muestran en esta consola (modo prueba).'
    );
  }
  return transporter;
};

// ─────────────────────────────────────────────────────────────────────
// 3. HERRAMIENTAS PARA ARMAR EL CONTENIDO
// ─────────────────────────────────────────────────────────────────────

// Escapa caracteres especiales de HTML. Cualquier dato que escribió un
// usuario (nombre, apellido, nombre de producto) se pasa por acá antes de
// meterlo en el HTML del mail. Si alguien se registra con el nombre
// "<script>..." o "<b>", sin esto ese código viajaría dentro del mail.
const esc = (valor) =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const plata = (numero) => '$' + Number(numero || 0).toLocaleString('es-AR');

// Envuelve el contenido de cada mail en el mismo diseño (cabecera, tarjeta,
// pie). Los mails usan estilos "inline" y tablas porque muchos clientes de
// correo (Gmail, Outlook) ignoran el CSS normal.
const plantilla = ({ titulo, cuerpoHtml, textoBoton, urlBoton }) => {
  const boton = urlBoton
    ? `<p style="margin:24px 0 0;"><a href="${esc(urlBoton)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;">${esc(textoBoton)}</a></p>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#4f46e5;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:bold;">${esc(nombreTienda())}</td></tr>
        <tr><td style="padding:28px;font-size:15px;line-height:1.5;">
          <h1 style="margin:0 0 16px;font-size:22px;">${esc(titulo)}</h1>
          ${cuerpoHtml}
          ${boton}
        </td></tr>
        <tr><td style="padding:16px 28px;background:#f8fafc;color:#64748b;font-size:12px;">Este es un mensaje automático de ${esc(nombreTienda())}. Por favor no respondas a este correo.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

// Tabla con los productos de un pedido (se usa en el mail al cliente y al admin).
const tablaItems = (items, total) => {
  const filas = items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${esc(item.Producto?.nombre || 'Producto')}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:center;">${esc(item.cantidad)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">${plata(item.subTotal)}</td>
      </tr>`
    )
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;">
    <tr style="color:#64748b;text-align:left;">
      <th style="padding:8px 0;border-bottom:2px solid #e2e8f0;">Producto</th>
      <th style="padding:8px 0;border-bottom:2px solid #e2e8f0;text-align:center;">Cant.</th>
      <th style="padding:8px 0;border-bottom:2px solid #e2e8f0;text-align:right;">Subtotal</th>
    </tr>
    ${filas}
    <tr>
      <td colspan="2" style="padding:12px 0;font-weight:bold;">Total</td>
      <td style="padding:12px 0;font-weight:bold;text-align:right;">${plata(total)}</td>
    </tr>
  </table>`;
};

// Versión en texto plano de la lista de productos (para clientes de mail
// que no muestran HTML, y para ver el mail en la consola en modo prueba).
const listaItemsTexto = (items) =>
  items
    .map((i) => `  - ${i.Producto?.nombre || 'Producto'} x${i.cantidad}: ${plata(i.subTotal)}`)
    .join('\n');

// ─────────────────────────────────────────────────────────────────────
// 4. ENVÍO (la única función que habla con Nodemailer)
// ─────────────────────────────────────────────────────────────────────
// Devuelve true si salió bien, false si falló. NUNCA tira error: lo captura,
// lo muestra en consola, y devuelve false.

const enviarMail = async ({ para, asunto, texto, html }) => {
  try {
    const cartero = obtenerTransporter();
    await cartero.sendMail({
      from: remitente(),
      to: para,
      subject: asunto,
      text: texto, // versión texto plano
      html, // versión con diseño
    });

    if (modoPrueba) {
      console.log(`\n📧 [MODO PRUEBA - no se envió realmente]\n   Para:   ${para}\n   Asunto: ${asunto}\n   ----\n${texto}\n`);
    } else {
      console.log(`📧 Mail enviado a ${para} — "${asunto}"`);
    }
    return true;
  } catch (error) {
    console.error(`❌ No se pudo enviar el mail "${asunto}" a ${para}:`, error.message);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────
// 5. MAIL #1 — BIENVENIDA (al registrarse)
// ─────────────────────────────────────────────────────────────────────
// Se llama desde authController.registrarUsuario.
// Recibe el usuario recién creado (necesita .nombre y .email).

export const enviarBienvenida = async (usuario) => {
  try {
    const nombre = usuario.nombre || 'cliente';
    const asunto = `¡Bienvenido/a a ${nombreTienda()}!`;

    const texto =
      `Hola ${nombre},\n\n` +
      `Tu cuenta en ${nombreTienda()} se creó con éxito. Ya podés explorar el catálogo y hacer tus compras.\n\n` +
      `Ver catálogo: ${urlFrontend()}/catalogo\n`;

    const html = plantilla({
      titulo: `¡Hola, ${nombre}!`,
      cuerpoHtml: `<p>Tu cuenta en <strong>${esc(nombreTienda())}</strong> se creó con éxito. 🎸</p>
        <p>Ya podés explorar el catálogo, armar tu carrito y hacer tus compras.</p>`,
      textoBoton: 'Ver el catálogo',
      urlBoton: `${urlFrontend()}/catalogo`,
    });

    return await enviarMail({ para: usuario.email, asunto, texto, html });
  } catch (error) {
    console.error('❌ Error armando el mail de bienvenida:', error.message);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────
// 6. MAIL #2 — RECUPERAR CONTRASEÑA
// ─────────────────────────────────────────────────────────────────────
// Se llama desde authController.olvideClave.
// Recibe el usuario y el token ya generado (ver utils/auth.js). Acá solo
// armamos el enlace y el mail.

export const enviarRecuperacionClave = async (usuario, token) => {
  try {
    const nombre = usuario.nombre || 'cliente';
    const enlace = `${urlFrontend()}/restablecer-clave?token=${encodeURIComponent(token)}`;
    const asunto = 'Recuperá tu contraseña';

    const texto =
      `Hola ${nombre},\n\n` +
      `Recibimos un pedido para restablecer tu contraseña. Entrá a este enlace para elegir una nueva (vale por 1 hora y se puede usar una sola vez):\n\n` +
      `${enlace}\n\n` +
      `Si no lo pediste vos, ignorá este mensaje: tu contraseña actual sigue siendo la misma.\n`;

    const html = plantilla({
      titulo: 'Restablecer contraseña',
      cuerpoHtml: `<p>Hola ${esc(nombre)},</p>
        <p>Recibimos un pedido para restablecer tu contraseña. Tocá el botón para elegir una nueva.
        El enlace vale por <strong>1 hora</strong> y se puede usar <strong>una sola vez</strong>.</p>
        <p style="color:#64748b;font-size:13px;">Si no lo pediste vos, ignorá este mensaje: tu contraseña actual sigue siendo la misma.</p>`,
      textoBoton: 'Elegir nueva contraseña',
      urlBoton: enlace,
    });

    return await enviarMail({ para: usuario.email, asunto, texto, html });
  } catch (error) {
    console.error('❌ Error armando el mail de recuperación:', error.message);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────
// 7. PEDIDOS — cargar los datos desde la base
// ─────────────────────────────────────────────────────────────────────
// Las dos funciones de pedidos de abajo reciben SOLO el id de la compra y
// buscan ellas mismas todo lo demás (comprador, productos, total). Así, quien
// las llama (el módulo A) no tiene que armar ni pasar ningún objeto: le
// alcanza con `notificarPedidoCreado(compra.id)`.

const cargarPedido = async (compraId) => {
  const compra = await Compra.findByPk(compraId);
  if (!compra) return null;

  const comprador = await Usuario.findByPk(compra.idUsuario);
  const items = await CompraProducto.findAll({
    where: { idCompra: compra.id },
    include: [Producto],
  });

  return { compra, comprador, items };
};

// A quién le avisamos cuando entra un pedido nuevo. Primero se mira
// MAIL_ADMIN en el .env (una o varias direcciones separadas por coma). Si no
// está, se usan los emails de todos los administradores de la base de datos.
const obtenerDestinatariosAdmin = async () => {
  if (process.env.MAIL_ADMIN) {
    return process.env.MAIL_ADMIN.split(',').map((e) => e.trim()).filter(Boolean);
  }
  const admins = await Administrador.findAll({ attributes: ['email'] });
  return admins.map((a) => a.email).filter(Boolean);
};

// ─────────────────────────────────────────────────────────────────────
// 8. MAIL #3 — PEDIDO CREADO (doble notificación: cliente + admin)
// ─────────────────────────────────────────────────────────────────────
// Se llama desde el controlador que crea el pedido, DESPUÉS de guardar en
// la base de datos (después del commit).

export const notificarPedidoCreado = async (compraId) => {
  try {
    const datos = await cargarPedido(compraId);
    if (!datos) {
      console.error(`❌ notificarPedidoCreado: no existe la compra #${compraId}`);
      return false;
    }
    const { compra, comprador, items } = datos;
    const fecha = new Date(compra.fecha || Date.now()).toLocaleString('es-AR');
    const nombreComprador = comprador ? `${comprador.nombre || ''} ${comprador.apellido || ''}`.trim() : 'Cliente';

    let todoOk = true;

    // ── (a) Mail al CLIENTE: su comprobante ──
    if (comprador?.email) {
      const asunto = `Recibimos tu pedido #${compra.id}`;
      const texto =
        `Hola ${comprador.nombre || ''},\n\n` +
        `¡Gracias por tu compra! Este es el comprobante de tu pedido #${compra.id} (${fecha}):\n\n` +
        `${listaItemsTexto(items)}\n\n` +
        `Total: ${plata(compra.total)}\nMedio de pago: ${compra.medioPago || '-'}\n\n` +
        `Te vamos a avisar por mail cada vez que cambie el estado de tu pedido.\n`;

      const html = plantilla({
        titulo: `¡Gracias por tu compra, ${comprador.nombre || ''}!`,
        cuerpoHtml: `<p>Este es el comprobante de tu pedido <strong>#${esc(compra.id)}</strong> (${esc(fecha)}).</p>
          ${tablaItems(items, compra.total)}
          <p>Medio de pago: <strong>${esc(compra.medioPago || '-')}</strong></p>
          <p>Te vamos a avisar por mail cada vez que cambie el estado de tu pedido.</p>`,
      });

      todoOk = (await enviarMail({ para: comprador.email, asunto, texto, html })) && todoOk;
    }

    // ── (b) Mail al ADMINISTRADOR: aviso de pedido nuevo ──
    const destinatariosAdmin = await obtenerDestinatariosAdmin();
    if (destinatariosAdmin.length > 0) {
      const asunto = `Nuevo pedido #${compra.id} para gestionar`;
      const texto =
        `Ingresó un nuevo pedido (#${compra.id}) el ${fecha}.\n\n` +
        `Comprador: ${nombreComprador} <${comprador?.email || 'sin email'}>\n\n` +
        `${listaItemsTexto(items)}\n\n` +
        `Total: ${plata(compra.total)}\nMedio de pago: ${compra.medioPago || '-'}\n\n` +
        `Ingresá al panel de administración para gestionarlo.\n`;

      const html = plantilla({
        titulo: `Nuevo pedido #${compra.id}`,
        cuerpoHtml: `<p>Ingresó un nuevo pedido el ${esc(fecha)}.</p>
          <p><strong>Comprador:</strong> ${esc(nombreComprador)} &lt;${esc(comprador?.email || 'sin email')}&gt;</p>
          ${tablaItems(items, compra.total)}
          <p>Medio de pago: <strong>${esc(compra.medioPago || '-')}</strong></p>
          <p>Ingresá al panel de administración para gestionarlo.</p>`,
      });

      todoOk = (await enviarMail({ para: destinatariosAdmin.join(', '), asunto, texto, html })) && todoOk;
    } else {
      console.warn('⚠️  No hay destinatarios de administrador (definí MAIL_ADMIN en el .env o creá un administrador).');
    }

    return todoOk;
  } catch (error) {
    console.error('❌ Error en notificarPedidoCreado:', error.message);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────
// 9. MAIL #4 — CAMBIÓ EL ESTADO DEL PEDIDO (aviso al cliente)
// ─────────────────────────────────────────────────────────────────────
// Se llama desde el controlador que cambia el estado, DESPUÉS de guardar.
//   notificarCambioEstado(compra.id, 'En preparación')
// Si no se pasa el estado, se lee de compra.estadoEnvio.

// Para comparar estados sin que importen mayúsculas, tildes ni guiones:
// "En preparación", "en_preparacion" y "EN PREPARACION" -> "en preparacion".
const normalizarEstado = (estado) =>
  String(estado || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .trim();

const ENPREP = {
  asunto: 'está en preparación',
  titulo: 'Tu pedido está en preparación',
  detalle: 'Estamos armando tu pedido para despacharlo.',
};

const MENSAJES_ESTADO = {
  pendiente: {
    asunto: 'está pendiente',
    titulo: 'Tu pedido está pendiente',
    detalle: 'Registramos tu pedido y en breve lo vamos a revisar.',
  },
  // El panel de administración guarda este estado como "preparacion"
  // (sin tilde y sin "en"), así que se aceptan las dos formas.
  'en preparacion': ENPREP,
  preparacion: ENPREP,
  enviado: {
    asunto: 'fue enviado',
    titulo: 'Tu pedido fue enviado',
    detalle: '¡Ya está en camino! Pronto lo vas a tener en tus manos.',
  },
  entregado: {
    asunto: 'fue entregado',
    titulo: 'Tu pedido fue entregado',
    detalle: 'Tu pedido llegó a destino. ¡Esperamos que lo disfrutes!',
  },
  cancelado: {
    asunto: 'fue cancelado',
    titulo: 'Tu pedido fue cancelado',
    detalle: 'Cancelamos tu pedido. Si no lo pediste vos o tenés dudas, contactanos.',
  },
};

export const notificarCambioEstado = async (compraId, estadoNuevo) => {
  try {
    const datos = await cargarPedido(compraId);
    if (!datos) {
      console.error(`❌ notificarCambioEstado: no existe la compra #${compraId}`);
      return false;
    }
    const { compra, comprador, items } = datos;

    if (!comprador?.email) {
      console.error(`❌ notificarCambioEstado: la compra #${compraId} no tiene un comprador con email`);
      return false;
    }

    const estado = estadoNuevo || compra.estadoEnvio || 'actualizado';
    const info = MENSAJES_ESTADO[normalizarEstado(estado)] || {
      asunto: 'cambió de estado',
      titulo: 'El estado de tu pedido cambió',
      detalle: `El nuevo estado de tu pedido es: ${estado}.`,
    };

    const asunto = `Tu pedido #${compra.id} ${info.asunto}`;
    const texto =
      `Hola ${comprador.nombre || ''},\n\n` +
      `${info.titulo} (pedido #${compra.id}).\n${info.detalle}\n\n` +
      `Detalle del pedido:\n${listaItemsTexto(items)}\nTotal: ${plata(compra.total)}\n`;

    const html = plantilla({
      titulo: info.titulo,
      cuerpoHtml: `<p>Hola ${esc(comprador.nombre || '')},</p>
        <p>${esc(info.detalle)}</p>
        <p style="color:#64748b;font-size:13px;">Pedido #${esc(compra.id)}</p>
        ${tablaItems(items, compra.total)}`,
    });

    return await enviarMail({ para: comprador.email, asunto, texto, html });
  } catch (error) {
    console.error('❌ Error en notificarCambioEstado:', error.message);
    return false;
  }
};
