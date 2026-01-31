import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database/connection';
import { Favorite } from '../models/Favorite.model';
import { Property } from '../models/Property.model';
import { successResponse, errorResponse } from '../utils/response.util';

export const addFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const propertyId = req.params.propertyId;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    if (!propertyId) {
      errorResponse(res, 'Property ID is required', 400);
      return;
    }

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    const favoriteRepository = AppDataSource.getRepository(Favorite);
    const existingFavorite = await favoriteRepository.findOne({
      where: { userId, propertyId },
    });

    if (existingFavorite) {
      errorResponse(res, 'Property already in favorites', 400);
      return;
    }

    const favorite = favoriteRepository.create({
      userId,
      propertyId,
    });

    await favoriteRepository.save(favorite);

    successResponse(res, { favorite }, 'Property added to favorites', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.params;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const favoriteRepository = AppDataSource.getRepository(Favorite);
    const favorite = await favoriteRepository.findOne({
      where: { userId, propertyId },
    });

    if (!favorite) {
      errorResponse(res, 'Favorite not found', 404);
      return;
    }

    await favoriteRepository.remove(favorite);

    successResponse(res, {}, 'Property removed from favorites');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const favoriteRepository = AppDataSource.getRepository(Favorite);
    const skip = (Number(page) - 1) * Number(limit);

    const [favorites, total] = await favoriteRepository.findAndCount({
      where: { userId },
      relations: ['property', 'property.lister', 'property.lister.profile', 'property.media'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(limit),
    });

    successResponse(res, {
      favorites,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, 'Favorites fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const checkFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.params;

    if (!userId) {
      successResponse(res, { isFavorite: false }, 'Not authenticated');
      return;
    }

    const favoriteRepository = AppDataSource.getRepository(Favorite);
    const favorite = await favoriteRepository.findOne({
      where: { userId, propertyId },
    });

    successResponse(res, { isFavorite: !!favorite }, 'Favorite status checked');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};
