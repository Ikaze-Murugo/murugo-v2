import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/property/:propertyId', reviewController.getPropertyReviews);
router.get('/user/:userId', reviewController.getUserReviews);

router.use(authenticate);

router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

export default router;
