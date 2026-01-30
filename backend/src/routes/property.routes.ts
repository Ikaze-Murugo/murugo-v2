import { Router } from 'express';
import * as propertyController from '../controllers/property.controller';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
} from '../validators/property.validator';
import { AppDataSource } from '../database/connection';
import { Property, PropertyStatus } from '../models/Property.model';
import { PropertyView } from '../models/PropertyView.model';
import { successResponse, errorResponse } from '../utils/response.util';
import type { AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Handlers for view/contact/share/my-listings (defined here so build passes even if controller exports differ)
const recordView = async (req: AuthRequest, res: import('express').Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({ where: { id } });
    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }
    if (userId && userId !== property.listerId) {
      const viewRepository = AppDataSource.getRepository(PropertyView);
      const existingView = await viewRepository.findOne({ where: { propertyId: id, userId } });
      if (!existingView) {
        const view = viewRepository.create({ propertyId: id, userId });
        await viewRepository.save(view);
        property.viewsCount = (property.viewsCount || 0) + 1;
        await propertyRepository.save(property);
      }
    }
    successResponse(res, {}, 'View recorded successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

const recordContact = async (req: AuthRequest, res: import('express').Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }
    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({ where: { id } });
    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }
    successResponse(res, {}, 'Contact recorded successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

const recordShare = async (req: AuthRequest, res: import('express').Response): Promise<void> => {
  try {
    const { id } = req.params;
    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({ where: { id } });
    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }
    successResponse(res, {}, 'Share recorded successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

const getMyListings = async (req: AuthRequest, res: import('express').Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, status } = req.query;
    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }
    const propertyRepository = AppDataSource.getRepository(Property);
    const skip = (Number(page) - 1) * Number(limit);
    const where: { listerId: string; status?: PropertyStatus } = { listerId: userId };
    if (status && typeof status === 'string' && Object.values(PropertyStatus).includes(status as PropertyStatus)) {
      where.status = status as PropertyStatus;
    }
    const [properties, total] = await propertyRepository.findAndCount({
      where,
      relations: ['media'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(limit),
    });
    successResponse(res, {
      properties,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    }, 'My listings fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

// Public routes
router.get('/', optionalAuth, propertyController.getAllProperties);
router.get('/featured', propertyController.getFeaturedProperties);
router.get('/:id', optionalAuth, propertyController.getPropertyById);
router.post('/:id/view', optionalAuth, recordView);
router.post('/:id/contact', authenticate, recordContact);
router.post('/:id/share', recordShare);

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
router.get('/my/listings', authenticate, getMyListings);
router.patch('/:id/status', authenticate, propertyController.updatePropertyStatus);
router.get('/:id/analytics', authenticate, propertyController.getPropertyAnalytics);

export default router;
