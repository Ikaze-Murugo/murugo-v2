import { Router } from 'express';
import { AppDataSource } from '../database/connection';
import { User, UserRole } from '../models/User.model';
import { Property, PropertyStatus } from '../models/Property.model';
import { PropertyView } from '../models/PropertyView.model';
import { successResponse, errorResponse } from '../utils/response.util';
import type { AuthRequest } from '../middlewares/auth.middleware';
import * as propertyController from '../controllers/property.controller';

const router = Router();

// Simple admin-guard helper
const requireAdmin = (req: AuthRequest) => {
  const user = req.user;
  return !!user && user.role === UserRole.ADMIN;
};

// GET /admin/stats
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req)) {
      errorResponse(res, 'Admin access required', 403);
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const propertyRepo = AppDataSource.getRepository(Property);
    const viewRepo = AppDataSource.getRepository(PropertyView);

    const [totalUsers, totalProperties, availableProperties, pendingApprovals, totalViews] =
      await Promise.all([
        userRepo.count(),
        propertyRepo.count(),
        propertyRepo.count({ where: { status: PropertyStatus.AVAILABLE } }),
        propertyRepo.count({ where: { status: PropertyStatus.PENDING } }),
        viewRepo.count(),
      ]);

    successResponse(
      res,
      {
        totalUsers,
        totalProperties,
        availableProperties,
        pendingApprovals,
        totalViews,
      },
      'Admin stats fetched successfully'
    );
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to fetch admin stats', 500);
  }
});

// GET /admin/users
router.get('/users', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req)) {
      errorResponse(res, 'Admin access required', 403);
      return;
    }

    const { role, search, page = 1, limit = 20 } = req.query;
    const userRepo = AppDataSource.getRepository(User);

    const qb = userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.properties', 'property');

    if (role && typeof role === 'string') {
      qb.andWhere('user.role = :role', { role });
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        '(user.email ILIKE :term OR user.phone ILIKE :term OR profile.name ILIKE :term OR profile.companyName ILIKE :term)',
        { term }
      );
    }

    qb.skip((Number(page) - 1) * Number(limit)).take(Number(limit));

    const [users, total] = await qb.getManyAndCount();

    const shapedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.role,
      profileType: u.profileType,
      isActive: u.isActive,
      isEmailVerified: u.isEmailVerified,
      isPhoneVerified: u.isPhoneVerified,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      profile: u.profile
        ? { id: u.profile.id, name: u.profile.name, companyName: u.profile.companyName }
        : null,
      propertiesCount: Array.isArray(u.properties) ? u.properties.length : 0,
    }));

    successResponse(
      res,
      {
        users: shapedUsers,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      'Admin users fetched successfully'
    );
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to fetch users', 500);
  }
});

// GET /admin/properties/pending
router.get('/properties/pending', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req)) {
      errorResponse(res, 'Admin access required', 403);
      return;
    }

    const { page = 1, limit = 20 } = req.query;
    const propertyRepo = AppDataSource.getRepository(Property);

    const skip = (Number(page) - 1) * Number(limit);
    const [properties, total] = await propertyRepo.findAndCount({
      where: { status: PropertyStatus.PENDING },
      relations: ['lister', 'lister.profile', 'media'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(limit),
    });

    successResponse(
      res,
      {
        properties,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      'Pending properties fetched successfully'
    );
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to fetch pending properties', 500);
  }
});

// PATCH /admin/properties/:id/status – reuse property controller logic
router.patch('/properties/:id/status', (req, res) => {
  if (!requireAdmin(req as AuthRequest)) {
    errorResponse(res, 'Admin access required', 403);
    return;
  }
  return propertyController.updatePropertyStatus(req as AuthRequest, res);
});

export default router;

