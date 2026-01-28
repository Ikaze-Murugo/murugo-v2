import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { successResponse } from '../utils/response.util';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { profile: req.user?.profile }, 'Profile fetched successfully');
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { profile: {} }, 'Profile updated successfully');
};

export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { preferences: {} }, 'Preferences updated successfully');
};

export const getPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { preferences: {} }, 'Preferences fetched successfully');
};

export const submitSurvey = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, {}, 'Survey submitted successfully');
};
