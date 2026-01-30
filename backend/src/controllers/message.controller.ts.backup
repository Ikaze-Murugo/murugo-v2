import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { successResponse } from '../utils/response.util';

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { conversations: [] }, 'Conversations fetched successfully');
};

export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { messages: [] }, 'Conversation fetched successfully');
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { message: {} }, 'Message sent successfully', 201);
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, {}, 'Message marked as read');
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, {}, 'Message deleted successfully');
};
