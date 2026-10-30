// Importamos Sequelize, la librería que permite conectarse a la base de datos.
import { Sequelize } from 'sequelize';

// Importamos dotenv para poder leer las variables del archivo .env.
import dotenv from 'dotenv';
dotenv.config();

// Creamos una nueva instancia de Sequelize con los datos de conexión.
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Nombre de la base de datos
  process.env.DB_USER,      // Usuario de MySQL
  process.env.DB_PASSWORD,  // Contraseña de MySQL
  {
    host: process.env.DB_HOST,   // Dónde está corriendo MySQL
    port: process.env.DB_PORT,   // Puerto de MySQL
    dialect: 'mysql',            // Tipo de base de datos
    logging: false,              // Desactiva los mensajes SQL en la consola
  }
);

// Exportamos la conexión para usarla en otros archivos.
export default sequelize;