import express from 'express';
import cors from 'cors';
import routes from './routes/index.js'; // Las rutas ya se importan desde este directorio

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json());


app.use('/api', routes);

export default app;

/*

Este archivo app.js dentro de la carpeta src suele ser el encargado de configurar y construir la aplicación del servidor
    SE ENCARGA DE:
    Crear la aplicación Express: instancia el servidor mediante express()
    Configurar middlewares: por ejemplo, express.json() para interpretar datos JSON que llegan en las solicitudes.
    Configurar CORS: permite que el frontend pueda comunicarse con la API.
    Registrar las rutas: conecta los endpoints con sus respectivos controladores.
    Configurar el manejo de errores: centraliza el tratamiento de errores de la API.


FLUJO:
server.js → app.js → routes → controllers → models → database
*/
