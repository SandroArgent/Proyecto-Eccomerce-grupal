import { Router } from 'express';
import {
  getProductos,
  getProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../controllers/productoController.js';
import { verificarAdmin } from '../middleware/auth.js';
import { validarProducto } from '../middleware/validacion.js';
import { subirImagenesProducto } from '../middleware/upload.js';

const router = Router();

// Ver productos es público: cualquier visitante del ecommerce puede
// consultar el catálogo sin loguearse.
router.get('/', getProductos);
router.get('/:id', getProductoPorId);

// Crear, editar o borrar productos solo lo puede hacer un administrador logueado.
// validarProducto corre después de verificarAdmin: primero confirmamos
// que quien pide esto tiene permiso, después revisamos que los datos
// que mandó tengan sentido.
//
// subirImagenesProducto (Multer) va DESPUÉS de verificarAdmin, así nadie sin
// permiso puede llenar el disco de archivos, y ANTES de validarProducto,
// porque con multipart/form-data req.body recién existe cuando Multer corre.
router.post('/', verificarAdmin, subirImagenesProducto, validarProducto, crearProducto);
router.put('/:id', verificarAdmin, subirImagenesProducto, validarProducto, actualizarProducto);
router.delete('/:id', verificarAdmin, eliminarProducto);

export default router;

