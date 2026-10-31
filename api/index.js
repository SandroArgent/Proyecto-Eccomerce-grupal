import app from './src/app.js';
import { sequelize } from './src/models/index.js';

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    await sequelize.sync();
    console.log('Modelos sincronizados con la base de datos.');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

iniciarServidor();


/* index (archivo raiz)
Es el archivo que levanta la aplicación.
Importa la aplicación Express configurada en src/app.js, conecta la base de datos mediante Sequelize y pone a escuchar al servidor en el puerto asignado (por ejemplo, el puerto 3000).
*/
