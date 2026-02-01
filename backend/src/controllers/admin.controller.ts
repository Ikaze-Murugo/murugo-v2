import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database/connection';
import { User } from '../models/User.model';
import { Property, PropertyStatus } from '../models/Property.model';
import { successResponse, errorResponse } from '../utils/response.util';

/**
 * GET /admin/stats - platform stats (admin only)
 */
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    if (role !== 'admin') {
      errorResponse(res, 'Admin access required', 403);
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const propertyRepository = AppDataSource.getRepository(Property);

    const totalUsersRaw = await userRepository
      .createQueryBuilder('user')
      .select('COUNT(user.id)', 'count')
      .where('user.isActive = :active', { active: true })
      .getRawOne<{ count: string }>();
    const totalUsers = Number(totalUsersRaw?.count ?? 0);

    const totalProperties = await propertyRepository.count();

    const availableProperties = await propertyRepository.count({
      where: { status: PropertyStatus.AVAILABLE },
    });

    const pendingApprovals = await propertyRepository.count({
      where: { status: PropertyStatus.PENDING },
    });

    const totalViewsRaw = await propertyRepository
      .createQueryBuilder('property')
      .select('COALESCE(SUM(property.viewsCount), 0)', 'total')
      .getRawOne<{ total: string }>();
    const totalViews = Number(totalViewsRaw?.total ?? 0);

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
};
