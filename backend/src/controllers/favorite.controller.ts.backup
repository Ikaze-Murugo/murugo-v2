import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { successResponse } from '../utils/response.util';

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { favorites: [] }, 'Favorites fetched successfully');
};

export const addFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, {}, 'Property added to favorites', 201);
};

export const removeFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, {}, 'Property removed from favorites');
};

export const checkFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { isFavorite: false }, 'Favorite status checked');
};
