import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database/connection';
import { User, UserRole } from '../models/User.model';
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

/**
 * GET /admin/users - list users with filters (admin only)
 * Query: role (seeker|lister|admin), search (email/name), page, limit
 */
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = req.user?.role;
    if (!req.user?.id) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }
    if (role !== 'admin') {
      errorResponse(res, 'Admin access required', 403);
      return;
    }

    const { role: filterRole, search, page = 1, limit = 20 } = req.query;
    const userRepository = AppDataSource.getRepository(User);
    const propertyRepository = AppDataSource.getRepository(Property);

    const qb = userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .select([
        'user.id',
        'user.email',
        'user.phone',
        'user.role',
        'user.profileType',
        'user.isActive',
        'user.isEmailVerified',
        'user.isPhoneVerified',
        'user.createdAt',
        'user.lastLogin',
        'profile.id',
        'profile.name',
        'profile.companyName',
      ]);

    if (filterRole && typeof filterRole === 'string' && Object.values(UserRole).includes(filterRole as UserRole)) {
      qb.andWhere('user.role = :role', { role: filterRole });
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        '(user.email ILIKE :term OR user.phone ILIKE :term OR profile.name ILIKE :term OR profile.companyName ILIKE :term)',
        { term }
      );
    }

    const total = await qb.getCount();

    const skip = (Number(page) - 1) * Number(limit);
    qb.orderBy('user.createdAt', 'DESC').skip(skip).take(Number(limit));
    const users = await qb.getMany();

    const userIds = users.map((u) => u.id);
    const propertyCountsRaw =
      userIds.length > 0
        ? await propertyRepository
            .createQueryBuilder('property')
            .select('property.listerId', 'listerId')
            .addSelect('COUNT(property.id)', 'count')
            .where('property.listerId IN (:...ids)', { ids: userIds })
            .groupBy('property.listerId')
            .getRawMany<{ listerId: string; count: string }>()
        : [];

    const propertyCountByUser: Record<string, number> = {};
    propertyCountsRaw.forEach((row) => {
      propertyCountByUser[row.listerId] = Number(row.count);
    });

    const sanitized = users.map((u) => ({
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
        ? {
            id: u.profile.id,
            name: u.profile.name,
            companyName: u.profile.companyName,
          }
        : null,
      propertiesCount: u.role === 'lister' ? (propertyCountByUser[u.id] ?? 0) : undefined,
    }));

    successResponse(
      res,
      {
        users: sanitized,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      'Users fetched successfully'
    );
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to fetch users', 500);
  }
};
