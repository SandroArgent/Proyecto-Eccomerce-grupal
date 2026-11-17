// codigosVerificacion.js — códigos de confirmación de email para el REGISTRO.
//
// IDEA: cuando alguien se registra NO se crea el usuario todavía. Se le manda
// un código de 6 dígitos al email que escribió; recién cuando lo ingresa bien
// se crea la cuenta. Así se comprueba que el email existe y es suyo.
//
// Los registros pendientes se guardan en MEMORIA del servidor (un Map), sin
// tablas ni columnas nuevas. Consecuencia: si se reinicia el servidor, los
// pendientes se pierden y la persona simplemente se vuelve a registrar.

import { randomInt } from 'crypto';

const VIGENCIA_MS = 10 * 60 * 1000; // el código vale 10 minutos
const MAX_INTENTOS = 5;             // intentos fallidos antes de invalidarlo
const ESPERA_REENVIO_MS = 30 * 1000; // mínimo entre un envío y el siguiente

// clave: "ámbito:identificador" -> { datos, codigo, expira, intentos, enviadoEn }
// Ámbitos: 'registro' (identificador = email) y 'perfil' (identificador = id del
// usuario, para confirmar un cambio de email desde Mi perfil).
const pendientes = new Map();

const clave = (identificador, ambito = 'registro') =>
  `${ambito}:${String(identificador).trim().toLowerCase()}`;

// Borra los pendientes vencidos para que el Map no crezca para siempre.
const limpiarVencidos = () => {
  const ahora = Date.now();
  for (const [k, p] of pendientes) {
    if (p.expira < ahora) pendientes.delete(k);
  }
};

/**
 * Guarda (o reemplaza) el registro pendiente de un email y genera un código nuevo.
 * @param {object} datos - lo que se aplicará al confirmar el código
 * @param {string} identificador - email (registro) o id de usuario (perfil)
 * @returns {{ok: true, codigo: string} | {ok: false, esperar: number}}
 */
export const emitirCodigo = (datos, identificador = datos.email, ambito = 'registro') => {
  limpiarVencidos();
  const k = clave(identificador, ambito);
  const previo = pendientes.get(k);

  if (previo) {
    const falta = ESPERA_REENVIO_MS - (Date.now() - previo.enviadoEn);
    if (falta > 0) return { ok: false, esperar: Math.ceil(falta / 1000) };
  }

  const codigo = String(randomInt(0, 1000000)).padStart(6, '0');
  pendientes.set(k, {
    datos,
    codigo,
    expira: Date.now() + VIGENCIA_MS,
    intentos: 0,
    enviadoEn: Date.now(),
  });
  return { ok: true, codigo };
};

/** Devuelve los datos guardados de un registro pendiente (o null si no hay). */
export const obtenerPendiente = (identificador, ambito = 'registro') => {
  limpiarVencidos();
  return pendientes.get(clave(identificador, ambito))?.datos || null;
};

/** Descarta un registro pendiente (por ejemplo si el mail no se pudo enviar). */
export const cancelarPendiente = (identificador, ambito = 'registro') => {
  pendientes.delete(clave(identificador, ambito));
};

/**
 * Comprueba el código ingresado.
 * @returns {{ok: true, datos} | {ok: false, motivo: string}}
 */
export const verificarCodigo = (identificador, codigoIngresado, ambito = 'registro') => {
  const k = clave(identificador, ambito);
  const p = pendientes.get(k);

  if (!p || p.expira < Date.now()) {
    pendientes.delete(k);
    return { ok: false, motivo: 'El código venció o no existe. Pedí uno nuevo.' };
  }

  if (String(codigoIngresado).trim() !== p.codigo) {
    p.intentos += 1;
    if (p.intentos >= MAX_INTENTOS) {
      pendientes.delete(k);
      return { ok: false, motivo: 'Demasiados intentos. Pedí un código nuevo.' };
    }
    return { ok: false, motivo: 'El código es incorrecto.' };
  }

  pendientes.delete(k); // el código sirve una sola vez
  return { ok: true, datos: p.datos };
};
