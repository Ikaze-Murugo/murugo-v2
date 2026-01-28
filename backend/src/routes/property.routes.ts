import { Router } from 'express';
import * as propertyController from '../controllers/property.controller';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
} from '../validators/property.validator';

const router = Router();

// Public routes
router.get('/', optionalAuth, propertyController.getAllProperties);
router.get('/featured', propertyController.getFeaturedProperties);
router.get('/:id', optionalAuth, propertyController.getPropertyById);
router.post('/:id/view', optionalAuth, propertyController.recordView);
router.post('/:id/contact', authenticate, propertyController.recordContact);
router.post('/:id/share', propertyController.recordShare);

// Protected routes (require authentication)
router.post(
  '/',
  authenticate,
  upload.array('images', 20),
  validateRequest(createPropertySchema),
  propertyController.createProperty
);

router.put(
  '/:id',
  authenticate,
  upload.array('images', 20),
  validateRequest(updatePropertySchema),
  propertyController.updateProperty
);

router.delete('/:id', authenticate, propertyController.deleteProperty);
router.get('/my/listings', authenticate, propertyController.getMyListings);
router.patch('/:id/status', authenticate, propertyController.updatePropertyStatus);
router.get('/:id/analytics', authenticate, propertyController.getPropertyAnalytics);

export default router;
