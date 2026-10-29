import { Router } from 'express';
import {
  getImagenProductos,
  getImagenProductoPorId,
  crearImagenProducto,
  actualizarImagenProducto,
  eliminarImagenProducto,
} from '../controllers/imagenProductoController.js';
import { verificarAdmin } from '../middleware/auth.js';

const router = Router();

// Ver imágenes es público: forman parte de la ficha del producto.
router.get('/', getImagenProductos);
router.get('/:id', getImagenProductoPorId);

// Solo un administrador puede subir, editar o borrar imágenes de producto.
router.post('/', verificarAdmin, crearImagenProducto);
router.put('/:id', verificarAdmin, actualizarImagenProducto);
router.delete('/:id', verificarAdmin, eliminarImagenProducto);

export default router;
