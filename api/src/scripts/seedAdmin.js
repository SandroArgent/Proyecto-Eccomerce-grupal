// seedAdmin.js — crea (o actualiza) un administrador inicial.
// Se corre UNA sola vez a mano, nunca desde una ruta pública de la API,
// porque no debería existir una forma de crear administradores sin ya
// ser administrador vos mismo.
//
// Uso (parado en la carpeta api/):
//   node src/scripts/seedAdmin.js "Nombre Admin" admin@tienda.com "unaContraseñaSegura"

import 'dotenv/config';
import { sequelize, Administrador } from '../models/index.js';

const [, , nombre, email, contraseña] = process.argv;

if (!nombre || !email || !contraseña) {
  console.error('Uso: node src/scripts/seedAdmin.js "Nombre" "email@dominio.com" "contraseña"');
  process.exit(1);
}

const seed = async () => {
  try {
    await sequelize.authenticate();

    const existente = await Administrador.findOne({ where: { email } });

    if (existente) {
      // Si ya existe, solo actualizamos la contraseña (el hook beforeUpdate
      // la vuelve a hashear automáticamente porque changed('contraseña') es true).
      existente.nombre = nombre;
      existente.contraseña = contraseña;
      await existente.save();
      console.log(`Administrador "${email}" ya existía: se actualizaron sus datos.`);
    } else {
      // Administrador.create dispara el hook beforeCreate, que hashea
      // la contraseña automáticamente antes de guardarla.
      await Administrador.create({ nombre, email, contraseña });
      console.log(`Administrador "${email}" creado correctamente.`);
    }
  } catch (error) {
    console.error('Error al crear el administrador:', error.message);
  } finally {
    await sequelize.close();
  }
};

seed();
