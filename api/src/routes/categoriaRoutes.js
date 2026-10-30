import { Router } from 'express';
import {
  getCategorias,
  getCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '../controllers/categoriaController.js';
import { verificarAdmin } from '../middleware/auth.js';
import { validarCategoria } from '../middleware/validacion.js';

const router = Router();

// Ver categorías es público (se usan para filtrar el catálogo).
router.get('/', getCategorias);
router.get('/:id', getCategoriaPorId);

// Solo un administrador puede crear, editar o borrar categorías.
router.post('/', verificarAdmin, validarCategoria, crearCategoria);
router.put('/:id', verificarAdmin, validarCategoria, actualizarCategoria);
router.delete('/:id', verificarAdmin, eliminarCategoria);

export default router;

