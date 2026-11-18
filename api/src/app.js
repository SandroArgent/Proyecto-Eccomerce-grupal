import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { UPLOADS_DIR } from './config/uploads.js';

const app = express();

app.use(cors());
app.use(express.json());

// Las imágenes subidas quedan accesibles en http://localhost:3000/uploads/...
app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/api', routes);

export default app;