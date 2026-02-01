import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.get('/stats', authenticate, adminController.getStats);
router.get('/users', authenticate, adminController.getUsers);

export default router;
