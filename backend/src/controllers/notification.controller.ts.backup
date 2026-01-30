import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { successResponse } from '../utils/response.util';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { notifications: [] }, 'Notifications fetched successfully');
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { count: 0 }, 'Unread count fetched successfully');
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, {}, 'Notification marked as read');
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, {}, 'All notifications marked as read');
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, {}, 'Notification deleted successfully');
};
