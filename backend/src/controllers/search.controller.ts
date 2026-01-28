import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { successResponse } from '../utils/response.util';

export const searchProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { properties: [], total: 0 }, 'Search completed successfully');
};

export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { properties: [] }, 'Recommendations fetched successfully');
};

export const getSimilarProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { properties: [] }, 'Similar properties fetched successfully');
};

export const autocomplete = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { suggestions: [] }, 'Autocomplete results fetched successfully');
};
