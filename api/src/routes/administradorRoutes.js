import { Router } from 'express';
import {
  getAdministradores,
  getAdministradorPorId,
  crearAdministrador,
  actualizarAdministrador,
  eliminarAdministrador,
} from '../controllers/administradorController.js';

const router = Router();

router.get('/', getAdministradores);
router.get('/:id', getAdministradorPorId);
router.post('/', crearAdministrador); 
router.put('/:id', actualizarAdministrador);
router.delete('/:id', eliminarAdministrador);

export default router;