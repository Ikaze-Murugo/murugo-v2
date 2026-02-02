import { Router } from 'express';
import * as listersController from '../controllers/listers.controller';

const router = Router();

// Public: get lister profile and their properties
router.get('/:id', listersController.getListerPublic);

export default router;
