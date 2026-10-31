import { Router } from 'express';

import authRoutes from './authRoutes.js';
import usuarioRoutes from './usuarioRoutes.js';
import telefonoRoutes from './telefonoRoutes.js';
import carritoRoutes from './carritoRoutes.js';
import domicilioRoutes from './domicilioRoutes.js';
import compraRoutes from './compraRoutes.js';
import compraProductoRoutes from './compraProductoRoutes.js';
import productoRoutes from './productoRoutes.js';
import productoPorCarritoRoutes from './productoPorCarritoRoutes.js';
import imagenProductoRoutes from './imagenProductoRoutes.js';
import categoriaRoutes from './categoriaRoutes.js';
import administradorRoutes from './administradorRoutes.js';
import { verificarAdmin } from '../middleware/auth.js';

const router = Router();

// Rutas de autenticación: /api/auth/usuario/login, /registro, /perfil,
// y /api/auth/admin/login.
router.use('/auth', authRoutes);

router.use('/usuarios', usuarioRoutes);
router.use('/telefonos', telefonoRoutes);
router.use('/carritos', carritoRoutes);
router.use('/domicilios', domicilioRoutes);
router.use('/compras', compraRoutes);
router.use('/compra-productos', compraProductoRoutes);
router.use('/productos', productoRoutes);
router.use('/producto-por-carrito', productoPorCarritoRoutes);
router.use('/imagenes-producto', imagenProductoRoutes);
router.use('/categorias', categoriaRoutes);

// /administradores queda protegida: hace falta un token de admin válido
// para listar, crear, editar o borrar administradores. Antes cualquiera
// podía hacerlo sin loguearse.
router.use('/administradores', verificarAdmin, administradorRoutes);

export default router;





/* 
¿Que es una ruta? Las rutas son los puntos de acceso (endpoints) que escuchan las peticiones que manda el frontend en React.
Rutas, solo llaman al controlador. Se crean cada una y conectan con la operacion del controlador a la que la ruta quiere invocar. Se unifica en index.js
    Su única función es recibir la petición HTTP (GET, POST, PUT, DELETE) y derivarla al controlador correspondiente.

FLUJO
routes/index.js  →  app.js  →  server.js
  (agrega)          (monta)     (levanta)  

El archivo de ruta individual solo decide qué controlador llamar */