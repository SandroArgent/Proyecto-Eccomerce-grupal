import { Router } from 'express';

import {
  getMarcas,
  getMarcaPorId,
  crearMarca,
  actualizarMarca,
  eliminarMarca,
} from '../controllers/marcaController.js';

import { verificarAdmin } from '../middleware/auth.js';

const router = Router();

// Ver marcas es público (se usan para formularios y filtros).
router.get('/', getMarcas);
router.get('/:id', getMarcaPorId);

// Solo administradores pueden modificar marcas.
router.post('/', verificarAdmin, crearMarca);
router.put('/:id', verificarAdmin, actualizarMarca);
router.delete('/:id', verificarAdmin, eliminarMarca);

export default router;