import { Router } from 'express';
import * as searchController from '../controllers/search.controller';
import { optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuth, searchController.searchProperties);
router.get('/recommendations', optionalAuth, searchController.getRecommendations);
router.get('/similar/:propertyId', searchController.getSimilarProperties);
router.get('/autocomplete', searchController.autocomplete);

export default router;
