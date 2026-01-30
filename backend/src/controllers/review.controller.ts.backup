import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { successResponse } from '../utils/response.util';

export const getPropertyReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { reviews: [] }, 'Property reviews fetched successfully');
};

export const getUserReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { reviews: [] }, 'User reviews fetched successfully');
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { review: {} }, 'Review created successfully', 201);
};

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { review: {} }, 'Review updated successfully');
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, {}, 'Review deleted successfully');
};
