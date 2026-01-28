import { Router } from 'express';
import * as favoriteController from '../controllers/favorite.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', favoriteController.getFavorites);
router.post('/:propertyId', favoriteController.addFavorite);
router.delete('/:propertyId', favoriteController.removeFavorite);
router.get('/check/:propertyId', favoriteController.checkFavorite);

export default router;
