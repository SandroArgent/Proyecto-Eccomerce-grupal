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