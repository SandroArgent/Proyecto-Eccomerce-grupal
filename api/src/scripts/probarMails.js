// probarMails.js — dispara cada mail del Módulo B a mano, sin pasar por la
// tienda. Sirve para probar el servicio de mensajería solo, y para
// mostrarlo funcionando aunque el Módulo A (pedidos) todavía no esté listo.
//
// Uso (parado en la carpeta api/):
//   node src/scripts/probarMails.js bienvenida   tu@correo.com
//   node src/scripts/probarMails.js recuperacion tu@correo.com
//   node src/scripts/probarMails.js pedido       <idDeUnaCompra>
//   node src/scripts/probarMails.js estado       <idDeUnaCompra> "En preparación"

import { sequelize, Usuario } from '../models/index.js';
import {
  enviarBienvenida,
  enviarRecuperacionClave,
  notificarPedidoCreado,
  notificarCambioEstado,
} from '../services/mailService.js';
import { generarTokenRecuperacion } from '../utils/auth.js';

const [, , tipo, arg1, arg2] = process.argv;

const ayuda = () => {
  console.log(`Uso:
  node src/scripts/probarMails.js bienvenida   tu@correo.com
  node src/scripts/probarMails.js recuperacion tu@correo.com
  node src/scripts/probarMails.js pedido       <idDeUnaCompra>
  node src/scripts/probarMails.js estado       <idDeUnaCompra> "En preparación"`);
};

const main = async () => {
  try {
    await sequelize.authenticate();

    if (tipo === 'bienvenida' && arg1) {
      // No hace falta que el usuario exista en la base: es un mail de prueba.
      await enviarBienvenida({ nombre: 'Prueba', email: arg1 });
    } else if (tipo === 'recuperacion' && arg1) {
      // Si el email pertenece a un usuario real, el enlace del mail FUNCIONA.
      // Si no, se usa un usuario inventado (el mail llega, pero el enlace no sirve).
      const usuario =
        (await Usuario.findOne({ where: { email: arg1 } })) ||
        { id: 0, nombre: 'Prueba', email: arg1, contraseña: 'inventada' };
      await enviarRecuperacionClave(usuario, generarTokenRecuperacion(usuario));
    } else if (tipo === 'pedido' && arg1) {
      await notificarPedidoCreado(Number(arg1));
    } else if (tipo === 'estado' && arg1) {
      await notificarCambioEstado(Number(arg1), arg2);
    } else {
      ayuda();
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Cerramos la conexión a la base; si no, el script queda colgado.
    await sequelize.close();
  }
};

main();
