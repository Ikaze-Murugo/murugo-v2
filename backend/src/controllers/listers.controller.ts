import { Request, Response } from 'express';
import { AppDataSource } from '../database/connection';
import { User, UserRole } from '../models/User.model';
import { Property, PropertyStatus } from '../models/Property.model';
import { successResponse, errorResponse } from '../utils/response.util';

/**
 * Public lister profile + their listed properties.
 * GET /listers/:id
 */
export const getListerPublic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user || user.role !== UserRole.LISTER) {
      errorResponse(res, 'Lister not found', 404);
      return;
    }

    const propertyRepository = AppDataSource.getRepository(Property);
    const properties = await propertyRepository.find({
      where: { listerId: id, status: PropertyStatus.AVAILABLE },
      relations: ['media'],
      order: { createdAt: 'DESC' },
    });

    const publicProfile = {
      id: user.id,
      role: user.role,
      profileType: user.profileType,
      profile: user.profile
        ? {
            name: user.profile.name,
            bio: user.profile.bio,
            companyName: user.profile.companyName,
            avatarUrl: user.profile.avatarUrl,
          }
        : null,
    };

    successResponse(res, {
      lister: publicProfile,
      properties,
    }, 'Lister profile fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};
